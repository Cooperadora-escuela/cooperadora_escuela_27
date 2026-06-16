"""
Exporta la private key de la wallet custodial de un padre.

Uso (desde back/):
    python scripts/exportar_wallet_padre.py
"""

import os
import sys
import django
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mysite.settings")
django.setup()

from cryptography.fernet import Fernet
from core.models import Usuario

fernet = Fernet(os.environ["WALLET_ENCRYPTION_KEY"].encode())

DNI = input("DNI del padre: ").strip()

try:
    padre = Usuario.objects.get(dni=DNI, rol="PAD")
except Usuario.DoesNotExist:
    print(f"No se encontró un padre con DNI {DNI}")
    sys.exit(1)

if not padre.wallet_address:
    print("Este padre no tiene wallet generada.")
    sys.exit(1)

pk = fernet.decrypt(padre.wallet_private_key_encrypted.encode()).decode()
print(f"\nNombre:       {padre.nombre} {padre.apellido}")
print(f"Wallet:       {padre.wallet_address}")
print(f"Private key:  {pk}")
print("\nImportar en MetaMask: Import account → Paste private key")
print("Ver token COOP en Base Sepolia:")
print("  Contract: 0xa6dba267ad78b5179b5cd1ced6fc80cbd5a7a7e0")
