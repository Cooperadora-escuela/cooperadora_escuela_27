import json
import os
from pathlib import Path
from cryptography.fernet import Fernet
from web3 import Web3

_ENCRYPTION_KEY = os.environ.get("WALLET_ENCRYPTION_KEY", "")

_ABI_DIR         = Path(__file__).resolve().parent / "abi"
_ABI_DAO_PATH    = _ABI_DIR / "CooperadoraDAO.json"
_ABI_FACTORY_PATH = _ABI_DIR / "CooperadoraDAOFactory.json"

_RPC_URL     = os.environ.get("BASE_SEPOLIA_RPC_URL", "https://sepolia.base.org")
_PRIVATE_KEY = os.environ.get("BACKEND_WALLET_PRIVATE_KEY", "")

FACTORY_ADDRESS  = os.environ.get("FACTORY_CONTRACT_ADDRESS", "")
PRESIDENTE_PLATFORM = os.environ.get("PRESIDENTE_PLATFORM_ADDRESS", "")

TOKENS_POR_TIPO = {
    'mensual': 1,
    'anual': 10,
}


# ============ WALLETS ============

def generar_wallet() -> tuple[str, str]:
    """Genera un par de claves Ethereum. Retorna (address, private_key_encriptada)."""
    w3 = Web3()
    account = w3.eth.account.create()
    fernet = Fernet(_ENCRYPTION_KEY.encode())
    encrypted = fernet.encrypt(account.key.hex().encode()).decode()
    return account.address, encrypted


# ============ HELPERS ============

def _w3() -> Web3:
    return Web3(Web3.HTTPProvider(_RPC_URL))


def _load_abi(path: Path) -> list:
    with open(path) as f:
        return json.load(f)


def _get_dao(dao_address: str):
    w3 = _w3()
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(dao_address),
        abi=_load_abi(_ABI_DAO_PATH),
    )
    return w3, contract


def _get_factory():
    if not FACTORY_ADDRESS:
        raise ValueError("FACTORY_CONTRACT_ADDRESS no configurado")
    w3 = _w3()
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(FACTORY_ADDRESS),
        abi=_load_abi(_ABI_FACTORY_PATH),
    )
    return w3, contract


def _send_tx(w3, fn, gas: int = 300_000):
    """Construye, firma y envía una transacción. Lanza ValueError si la tx revierte."""
    account = w3.eth.account.from_key(_PRIVATE_KEY)
    base_fee = w3.eth.gas_price
    priority_fee = w3.to_wei(1, "gwei")

    tx = fn.build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address, "pending"),
        "gas": gas,
        "maxFeePerGas": base_fee + priority_fee,
        "maxPriorityFeePerGas": priority_fee,
    })

    signed = w3.eth.account.sign_transaction(tx, _PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt.status != 1:
        raise ValueError(f"Tx revertida: {tx_hash.hex()}")

    return tx_hash.hex(), receipt


# ============ DAO CLONE FACTORY ============

def deploy_dao_clone(nombre_escuela: str, ciclo_actual: int) -> str:
    """
    Llama a CooperadoraDAOFactory.crear() para deployar un clone EIP-1167.
    En una sola tx: clone → initialize → addMinter → registrarDAO en MetaDAO.
    Retorna el address del DAO clone creado.
    """
    if not FACTORY_ADDRESS:
        raise ValueError("FACTORY_CONTRACT_ADDRESS no configurado")
    if not PRESIDENTE_PLATFORM:
        raise ValueError("PRESIDENTE_PLATFORM_ADDRESS no configurado")
    if not _PRIVATE_KEY:
        raise ValueError("BACKEND_WALLET_PRIVATE_KEY no configurado")

    w3, factory = _get_factory()
    backend_wallet = w3.eth.account.from_key(_PRIVATE_KEY).address

    fn = factory.functions.crear(
        nombre_escuela,
        Web3.to_checksum_address(backend_wallet),  # mintAutorizado = backend wallet
        ciclo_actual,
        Web3.to_checksum_address(PRESIDENTE_PLATFORM),
    )

    _, receipt = _send_tx(w3, fn, gas=500_000)

    # Parsear el evento DAOCreado para obtener la dirección del clone
    abi = _load_abi(_ABI_FACTORY_PATH)
    factory_contract = w3.eth.contract(address=Web3.to_checksum_address(FACTORY_ADDRESS), abi=abi)
    logs = factory_contract.events.DAOCreado().process_receipt(receipt)

    if not logs:
        raise ValueError("No se encontró el evento DAOCreado en el receipt")

    return logs[0]["args"]["dao"]


# ============ DAO EXISTENTE (Escuela 27 y compatibilidad) ============

def registrar_padre_en_dao(wallet_padre: str, dao_address: str) -> str:
    """Registra la wallet del padre en el DAO con rol PADRE (0). Retorna tx hash."""
    w3, dao = _get_dao(dao_address)
    fn = dao.functions.agregarMiembro(
        Web3.to_checksum_address(wallet_padre),
        0,  # RolGobernanza.PADRE
    )
    tx_hash, _ = _send_tx(w3, fn)
    return tx_hash


def mint_token_padre(pago) -> list[str]:
    """Mintea tokens al padre según el tipo de pago. Retorna lista de tx hashes."""
    cantidad = TOKENS_POR_TIPO.get(pago.tipo)
    if not cantidad:
        raise ValueError(f"Tipo de pago '{pago.tipo}' no genera tokens")

    padre = pago.inscripcion.usuario.padre
    if padre is None:
        raise ValueError(f"Pago {pago.pk} no tiene padre asociado")

    wallet_padre = getattr(padre, "wallet_address", None)
    if not wallet_padre:
        raise ValueError(f"El padre del pago {pago.pk} no tiene wallet_address")

    dao_address = pago.cooperadora.dao_address
    if not dao_address:
        raise ValueError(f"La cooperadora del pago {pago.pk} no tiene dao_address")

    w3, dao = _get_dao(dao_address)
    wallet_checksum = Web3.to_checksum_address(wallet_padre)
    fn = dao.functions.mintTokenPadre(wallet_checksum)

    tx_hashes = []
    for _ in range(cantidad):
        tx_hash, _ = _send_tx(w3, fn)
        tx_hashes.append(tx_hash)

    return tx_hashes
