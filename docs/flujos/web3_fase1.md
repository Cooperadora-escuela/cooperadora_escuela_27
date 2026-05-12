# Web3 Fase 1 — Wallet custodial para padres

## Contexto

Integración invisible entre el sistema Django y el contrato `CooperadoraToken` en Base Sepolia.
Los padres usan la app Web2 sin cambios. La wallet y los tokens existen en segundo plano.

---

## Requerimientos funcionales

### RF-01 — Generación automática de wallet
- Al crear un usuario con `rol = Rol.PADRE`, el sistema genera automáticamente un par de claves Ethereum.
- Se guarda `wallet_address` (dirección pública) en el modelo `Usuario`.
- Se guarda `wallet_private_key_encrypted` (clave privada encriptada) en el modelo `Usuario`.
- Si el usuario PAD ya tiene `wallet_address`, no se regenera.
- El tesorero (TES) y el padre (PAD) **no ven ni interactúan** con la wallet en ningún flujo.

### RF-02 — Mint de token al registrar un pago
- Al registrar un pago (mensual, anual o donación), se mintea 1 token al padre del alumno.
- El mint se envía a `wallet_address` del padre asociado al alumno inscripto.
- El campo `token_minteado` en `Pago` refleja si el mint fue exitoso.
- El campo `token_mint_tx` guarda el hash de la transacción para auditoría.

### RF-03 — Reintentos de mint fallido
- Un management command `retry_mint_tokens` busca pagos con `token_minteado=False` y reintenta.
- Se puede ejecutar manualmente o por cron en Render.

---

## Requerimientos no funcionales

### RNF-01 — Seguridad
- `wallet_private_key_encrypted` nunca aparece en ningún serializer ni endpoint.
- `wallet_address` no se expone en endpoints de PAD ni TES (solo ADMIN si se necesita).
- La clave de encriptación (`WALLET_ENCRYPTION_KEY`) vive exclusivamente en variables de entorno.
- Si `BACKEND_WALLET_PRIVATE_KEY` o `WALLET_ENCRYPTION_KEY` no están configuradas, el sistema arranca igual pero el mint falla silenciosamente.

### RNF-02 — Resiliencia
- Un fallo en el mint **no bloquea ni revierte** el registro del pago.
- Todos los errores de mint se loguean con el `id` del pago para facilitar el debug.

### RNF-03 — Invisibilidad Web2
- Ningún cambio en la UX actual de padres o tesorero.
- Los campos `token_minteado`, `token_mint_tx`, `wallet_address` y `wallet_private_key_encrypted` no aparecen en los serializers de uso público.

---

## Modelo de datos — cambios

### `Usuario` (existente)
```
+ wallet_address            CharField(42, null, blank)   # dirección pública Ethereum
+ wallet_private_key_encrypted  TextField(null, blank)   # clave privada encriptada con Fernet
```

Solo se populan cuando `rol = Rol.PADRE`.

### `Pago` (existente, ya migrado en 0006)
```
+ token_minteado   BooleanField(default=False)
+ token_mint_tx    CharField(66, null, blank)
```

---

## Flujo completo

```
TES crea usuario PAD
  → post_save signal
  → genera par de claves Ethereum
  → encripta private key con Fernet + WALLET_ENCRYPTION_KEY
  → guarda wallet_address y wallet_private_key_encrypted

TES registra pago de cuota
  → post_save signal en Pago
  → obtiene wallet_address del padre del alumno
  → firma tx con BACKEND_WALLET_PRIVATE_KEY (wallet mintAutorizado)
  → llama mint(wallet_address_padre, 1 token) en CooperadoraToken
  → guarda token_minteado=True y token_mint_tx en Pago
```

---

## Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `BACKEND_WALLET_PRIVATE_KEY` | Clave privada de la wallet `mintAutorizado` del contrato |
| `WALLET_ENCRYPTION_KEY` | Clave Fernet para encriptar las private keys de los padres |
| `BASE_SEPOLIA_RPC_URL` | RPC de Base Sepolia (default: `https://sepolia.base.org`) |

Generar `WALLET_ENCRYPTION_KEY`:
```python
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())
```

---

## Contratos en producción (Base Sepolia)

| Contrato | Address |
|---|---|
| CooperadoraToken | `0xa6dba267ad78b5179b5cd1ced6fc80cbd5a7a7e0` |
| CooperadoraDAO | `0x77c6740a2031fa0684ea88edc9c6019fa0e7bd2b` |
| Wallet mintAutorizado | `0xa6ebab87a0a5890a5abb8d9efc93ee534878161c` |

---

## Fase 2 — migración a auto-custodia (pendiente)

Cuando se integre Privy en el frontend Web3:
1. El padre se autentica con email/Google → Privy genera una embedded wallet.
2. El frontend envía la nueva `wallet_address` al backend (endpoint protegido).
3. El backend actualiza `wallet_address` del padre.
4. `wallet_private_key_encrypted` puede borrarse una vez que el padre asume custodia.

Esta fase no requiere cambios en el flujo de mint — solo cambia la `wallet_address` de destino.
