import json
import os
from pathlib import Path
from cryptography.fernet import Fernet
from web3 import Web3

_ENCRYPTION_KEY = os.environ.get("WALLET_ENCRYPTION_KEY", "")


def generar_wallet() -> tuple[str, str]:
    """Genera un par de claves Ethereum. Retorna (address, private_key_encriptada)."""
    w3 = Web3()
    account = w3.eth.account.create()
    fernet = Fernet(_ENCRYPTION_KEY.encode())
    encrypted = fernet.encrypt(account.key.hex().encode()).decode()
    return account.address, encrypted


_ABI_DAO_PATH = Path(__file__).resolve().parent / "abi" / "CooperadoraDAO.json"
_DAO_ADDRESS  = os.environ.get("DAO_CONTRACT_ADDRESS", "0x77c6740a2031fa0684ea88edc9c6019fa0e7bd2b")
_RPC_URL        = os.environ.get("BASE_SEPOLIA_RPC_URL", "https://sepolia.base.org")
_PRIVATE_KEY    = os.environ.get("BACKEND_WALLET_PRIVATE_KEY", "")


def _get_dao():
    w3 = Web3(Web3.HTTPProvider(_RPC_URL))
    with open(_ABI_DAO_PATH) as f:
        abi = json.load(f)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(_DAO_ADDRESS), abi=abi
    )
    return w3, contract


def _send_tx(w3, fn):
    """Construye, firma y envía una transacción. Lanza ValueError si la tx revierte."""
    account = w3.eth.account.from_key(_PRIVATE_KEY)
    base_fee = w3.eth.gas_price
    priority_fee = w3.to_wei(1, "gwei")

    tx = fn.build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address, "pending"),
        "gas": 300_000,
        "maxFeePerGas": base_fee + priority_fee,
        "maxPriorityFeePerGas": priority_fee,
    })

    signed = w3.eth.account.sign_transaction(tx, _PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

    if receipt.status != 1:
        raise ValueError(f"Tx revertida: {tx_hash.hex()}")

    return tx_hash.hex()


def registrar_padre_en_dao(wallet_padre: str) -> str:
    """Registra la wallet del padre en el DAO con rol PADRE (0). Retorna tx hash."""
    w3, dao = _get_dao()
    fn = dao.functions.agregarMiembro(
        Web3.to_checksum_address(wallet_padre),
        0,  # RolGobernanza.PADRE
    )
    return _send_tx(w3, fn)


def mint_token_padre(pago) -> str:
    """Mintea 1 token al padre via DAO. Retorna el tx hash."""
    padre = pago.inscripcion.usuario.padre
    if padre is None:
        raise ValueError(f"Pago {pago.pk} no tiene padre asociado")

    wallet_padre = getattr(padre, "wallet_address", None)
    if not wallet_padre:
        raise ValueError(f"El padre del pago {pago.pk} no tiene wallet_address")

    w3, dao = _get_dao()
    fn = dao.functions.mintTokenPadre(Web3.to_checksum_address(wallet_padre))
    return _send_tx(w3, fn)
