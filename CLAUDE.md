# Cooperadora Escuela 27 — Contexto del proyecto

Sistema de gestión para la cooperadora de la Escuela 27. Cubre pagos de cuotas, alumnos, usuarios por roles y publicaciones institucionales.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Django 5.1 + DRF + SimpleJWT |
| Frontend | React 19 + Vite + TypeScript + Tailwind + MUI |
| Base de datos | PostgreSQL 15 |
| Contenedores | Docker + docker-compose |
| Auth | JWT (access + refresh + blacklist en logout) |

## Estructura del repo

```
cooperadora_escuela_27/
├── back/
│   ├── core/          # única app Django (models, views, serializers, urls, permissions)
│   ├── mysite/        # config Django (settings, urls raíz)
│   ├── manage.py
│   └── requirements.txt
├── front/
│   └── src/
│       ├── pages/     # una page por vista
│       ├── components/
│       └── contex/    # contexto de auth global
├── docs/              # diagramas ERD y flujos .mmd
└── docker-compose.yml
```

## Comandos frecuentes

```bash
# Levantar todo
docker compose up -d

# Backend local (dev)
cd back && python manage.py runserver

# Frontend local (dev)
cd front && npm run dev

# Migraciones
cd back && python manage.py makemigrations && python manage.py migrate

# Build frontend
cd front && npm run build
```

## Roles del sistema

| Rol | Creado por | Permisos |
|---|---|---|
| ADMIN | Existe por defecto | Todo |
| TES (Tesorero) | Admin | Usuarios, cuotas, pagos |
| PAD (Padre) | Tesorero | Ver cuotas e hijos propios |
| SOC (Socio/Alumno) | Tesorero | Sin acceso directo |
| isPresidente | (Fase actual) | Gestión completa |

## Endpoints principales (`/api/`)

- `POST /login/` — auth JWT
- `POST /logout/` — blacklist refresh token
- `POST /token/refresh/` — renovar access token
- `GET /me/` — usuario autenticado
- `POST /usuarios/crear/` — solo TES o ADMIN
- `GET /usuarios/` — lista de usuarios
- `GET /mis-hijos/` — hijos del PAD autenticado
- `GET /estado-cuenta/` — estado de cuotas del PAD
- ViewSets: `/grados/`, `/inscripciones/`, `/pagos/`, `/cuotas/`, `/publicaciones/`

## Reglas de negocio (no están en el código)

- Un padre/tutor NO puede cambiar de modalidad mensual → anual a mitad de año
- Un alumno solo puede tener UN padre/tutor registrado
- Un alumno no puede estar inscripto en más de un grado por año (`unique_together usuario+año`)
- La "deuda" no es un campo: ausencia de pago = deuda
- No hay auto-registro: todo lo crea TES o ADMIN
- Sin contenido público: todo detrás de login
- El email solo lo cambia el ADMIN

## Ramas

- `main` — rama estable, no romper
- `docker` — rama de desarrollo activa (históricamente)

## Notas de desarrollo

- El usuario conoce todos los flujos de negocio (fue presidente de la cooperadora)
- No explicar conceptos básicos de React, TypeScript, Docker o Django
- Priorizar claridad en decisiones de arquitectura y flujos de datos

## Resuelto

### Web3 Fase 1 — Wallet custodial para padres ✓
Integración invisible con `CooperadoraToken` en Base Sepolia. Doc completa en `docs/flujos/web3_fase1.md`.

- `wallet_address` y `wallet_private_key_encrypted` en `Usuario` (migración `0007`)
- `core/signals.py`: genera wallet al crear PAD + mintea token al crear `Pago`
- `core/web3_client.py`: `generar_wallet()` y `mint_token_padre()`
- `core/management/commands/retry_mint_tokens.py`: reintenta pagos con `token_minteado=False`
- `core/abi/CooperadoraDAO.json`: ABI del contrato DAO
- `back/scripts/exportar_wallet_padre.py`: desencripta y muestra private key de un padre por DNI (para importar a MetaMask)
- Flujo verificado end-to-end: crear PAD → wallet generada + registrada en DAO → registrar pago → 1 COOP minteado → visible en MetaMask y front de la DAO
- **Gotchas resueltos:** el backend llama `DAO.mintTokenPadre()` (no `token.mint()` directamente — el owner del token es el DAO); gas limit 300_000 (estimado real ~222k); `user.save(update_fields=['password'])` para no pisar wallet_address; nonce `pending` para evitar colisiones en pagos simultáneos; `registrar_padre_en_dao()` al crear PAD es obligatorio antes de poder mintear

## Contratos deployados (Base Sepolia)

| Contrato | Address |
|---|---|
| CooperadoraToken (COOP) | `0xa6dba267ad78b5179b5cd1ced6fc80cbd5a7a7e0` |
| CooperadoraDAO | `0x77c6740a2031fa0684ea88edc9c6019fa0e7bd2b` |
| Backend wallet (mintAutorizado) | `0xA6EBAb87A0a5890A5abB8D9eFC93eE534878161C` |

### Imágenes en publicaciones — renderizado en producción ✓
`imagen_portada` y galería (`PublicacionImagen`) funcionan correctamente. Cloudinary sirve las imágenes con URL `https://res.cloudinary.com/...` y se renderizan en el front.

**Solución aplicada:**
- `django-cloudinary-storage` reemplazado por storage nativo de Cloudinary
- Configuración migrada a `STORAGES` dict (Django 5.1)
- `cloudinary_storage` antes de `django.contrib.staticfiles` en INSTALLED_APPS
- `imagen_portada` como `ImageField` writable en el serializer
