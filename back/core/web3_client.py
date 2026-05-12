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

_ABI_PATH = Path(__file__).resolve().parent / "abi" / "CooperadoraToken.json"
_TOKEN_ADDRESS = "0xa6dba267ad78b5179b5cd1ced6fc80cbd5a7a7e0"
_RPC_URL = os.environ.get("BASE_SEPOLIA_RPC_URL", "https://sepolia.base.org")
_PRIVATE_KEY = os.environ.get("BACKEND_WALLET_PRIVATE_KEY", "")

# 1 token por cuota pagada (18 decimales)
_TOKENS_POR_CUOTA = Web3.to_wei(1, "ether")


def _get_contract():
    w3 = Web3(Web3.HTTPProvider(_RPC_URL))
    with open(_ABI_PATH) as f:
        abi = json.load(f)
    return w3, w3.eth.contract(address=Web3.to_checksum_address(_TOKEN_ADDRESS), abi=abi)


def mint_token_padre(pago) -> str:
    """Mintea 1 token al padre asociado al pago. Retorna el tx hash."""
    padre = pago.inscripcion.usuario.padre
    if padre is None:
        raise ValueError(f"Pago {pago.pk} no tiene padre asociado")

    wallet_padre = getattr(padre, "wallet_address", None)
    if not wallet_padre:
        raise ValueError(f"El padre del pago {pago.pk} no tiene wallet_address")

    w3, contract = _get_contract()
    account = w3.eth.account.from_key(_PRIVATE_KEY)

    tx = contract.functions.mint(
        Web3.to_checksum_address(wallet_padre),
        _TOKENS_POR_CUOTA,
    ).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 100_000,
        "maxFeePerGas": w3.eth.gas_price,
        "maxPriorityFeePerGas": w3.to_wei(1, "gwei"),
    })

    signed = w3.eth.account.sign_transaction(tx, _PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
    return tx_hash.hex()
