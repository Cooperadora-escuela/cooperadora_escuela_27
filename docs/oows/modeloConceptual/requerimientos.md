# Modelo Conceptual — Requerimientos
**Sistema:** CooperaApp — Gestión de Cooperadoras Escolares (SaaS Multi-tenant)
**Metodología:** OOWS

---

## 1. Requerimientos Funcionales

### Base

| ID   | Nombre                        | Descripción |
|------|-------------------------------|-------------|
| RF01 | Autenticar usuario            | El sistema permite el ingreso mediante email y clave dentro del contexto de su cooperadora (`/{slug}/login`). Devuelve tokens JWT (access + refresh). |
| RF02 | Crear usuario PAD             | Tesorero/Admin registran un padre: nombre, apellido, DNI, email, contraseña. El sistema genera automáticamente una wallet Ethereum custodial. |
| RF03 | Crear usuario SOC             | Tesorero/Admin registran un alumno con DNI del padre. El sistema lo vincula al PAD y crea la Inscripción en una transacción atómica. |
| RF04 | Listar usuarios               | Muestra todos los usuarios de la cooperadora. Solo TES/ADMIN. |
| RF05 | Ver detalle de usuario        | Muestra y permite editar un usuario identificado por UUID. |
| RF06 | Ver mis hijos                 | El PAD autenticado ve sus hijos con inscripciones y link a estado de cuenta. |
| RF07 | Listar grados                 | Muestra los grados disponibles de la cooperadora (1° a 7°, con división). |
| RF08 | Gestionar inscripciones       | Crea, edita o elimina inscripciones. Solo TES/ADMIN. |
| RF09 | Listar pagos                  | Muestra pagos filtrados por mes y año. Solo TES/ADMIN. |
| RF10 | Registrar pago simple         | Registra el pago de un mes. Excedente → donación. Monto insuficiente → donación. |
| RF11 | Registrar pago múltiple       | Registra varios meses en una operación. Excedente → donación. |
| RF12 | Registrar pago anual          | Registra un pago anual para inscripción modalidad anual. |
| RF13 | Configurar cuota mensual      | Define el monto de la cuota por mes y año para la cooperadora. |
| RF14 | Configurar pago anual         | Define el monto del pago anual para la cooperadora. |

### E01 — SaaS Onboarding

| ID   | Nombre                        | Descripción |
|------|-------------------------------|-------------|
| RF15 | Registro público de cooperadora | Cualquier cooperadora puede registrarse en `/register`. Se crea en estado PENDING. |
| RF16 | Aprobación por platform admin | El platform admin aprueba desde Django Admin. Genera token de activación UUID y envía email. |
| RF17 | Activación de cooperadora     | El contacto recibe un link de un solo uso `/{slug}/activar?token=...` y crea el usuario ADMIN de su cooperadora. |
| RF18 | Provisioning DAO clone        | Al activar una cooperadora (PENDING → TRIAL/ACTIVE), el sistema despliega automáticamente un DAO clone EIP-1167 en Base Sepolia y guarda el `dao_address`. |

### E02 — Wallet custodial (PAD)

| ID   | Nombre                        | Descripción |
|------|-------------------------------|-------------|
| RF19 | Generación de wallet          | Al crear un PAD, el sistema genera automáticamente un par de claves Ethereum y registra la wallet en el clone DAO de la cooperadora. |
| RF20 | Reveal-once de private key    | El PAD ve su private key una sola vez desde el Home (`/mi-wallet/`). Después solo ve la dirección pública. La key se guarda encriptada como red de seguridad. |
| RF21 | Mint de token COOP            | Al registrar un pago mensual o anual, se mintea 1 token COOP en la wallet del padre del alumno. No se mintea en donaciones. |
| RF22 | Reintentos de mint fallido    | El comando `retry_mint_tokens` reintenta pagos con `token_minteado=False`. |

### E03 — Comunicaciones (Secretario)

| ID   | Nombre                  | Descripción |
|------|-------------------------|-------------|
| RF23 | Crear publicación       | El Secretario crea publicaciones (noticia, agenda, novedad) con título, contenido e imagen de portada. |
| RF24 | Editar/Eliminar publicación | El Secretario edita o elimina publicaciones de su cooperadora. |
| RF25 | Listar publicaciones    | Todos los usuarios autenticados de la cooperadora pueden ver publicaciones. |

### E04 — Estado de cuenta (PAD)

| ID   | Nombre                  | Descripción |
|------|-------------------------|-------------|
| RF26 | Ver estado de cuenta    | El PAD ve cuotas pagas, pendientes y donaciones del año en curso para cada hijo. |

---

## 2. Restricciones

| ID  | Descripción |
|-----|-------------|
| R01 | Solo usuarios con `activo=True` pueden autenticarse. |
| R02 | Solo TES y ADMIN pueden crear, modificar o eliminar usuarios. |
| R03 | Solo TES y ADMIN pueden crear, modificar o eliminar inscripciones y pagos. |
| R04 | Un alumno solo puede tener una inscripción activa por año. |
| R05 | No se puede registrar el mismo mes dos veces para una misma inscripción. |
| R06 | No se puede registrar pago anual en inscripción mensual ni viceversa. |
| R07 | El año del pago debe coincidir con el año de la inscripción. |
| R08 | Si el monto no cubre la cuota, se registra íntegramente como donación. |
| R09 | Solo se puede vincular como padre a un usuario con rol PAD de la misma cooperadora. |
| R10 | Solo SEC y ADMIN pueden crear, editar o eliminar publicaciones. |
| R11 | Los PAD solo pueden ver publicaciones y estado de cuenta, no modificar nada. |
| R12 | El DNI es único por cooperadora (el mismo padre puede existir en dos escuelas con dos cuentas). |
| R13 | Toda query de negocio debe filtrarse por `cooperadora` — no hay acceso cross-tenant. |
| R14 | Una cooperadora sin `dao_address` genera wallets pero no las registra en el DAO ni mintea tokens. |
| R15 | La `private_key` del PAD nunca se expone en ningún endpoint excepto `GET /mi-wallet/` y solo si `key_revealed=False`. |

---

## 3. Requerimientos No Funcionales

| ID    | Categoría       | Nombre                    | Descripción |
|-------|-----------------|---------------------------|-------------|
| RNF01 | Seguridad       | Autenticación JWT         | Todas las rutas excepto login, registro y activación requieren token JWT válido. |
| RNF02 | Seguridad       | Control de acceso por rol | Acciones de escritura restringidas por rol. Middleware valida cooperadora activa. |
| RNF03 | Seguridad       | Custodia de wallets       | `wallet_private_key_encrypted` nunca aparece en serializers ni endpoints públicos. La clave de encriptación vive solo en variables de entorno. |
| RNF04 | Multi-tenancy   | Aislamiento por cooperadora | Toda query filtra por `cooperadora`. El middleware resuelve el tenant por slug en el path. |
| RNF05 | Multi-tenancy   | Routing path-based        | Cada cooperadora accede en `/{slug}/`. No requiere subdominios ni DNS por tenant. |
| RNF06 | Usabilidad      | Interfaz responsiva       | El frontend funciona en móviles y escritorio. |
| RNF07 | Performance     | Tiempo de respuesta       | Las operaciones responden en menos de 3 segundos bajo carga normal. |
| RNF08 | Portabilidad    | Compatibilidad web        | Funciona en Chrome, Firefox y Edge modernos. |
| RNF09 | Mantenibilidad  | Arquitectura modular      | Backend y frontend separados. Backend containerizable con Docker. |
| RNF10 | Trazabilidad    | UUID en usuarios          | Los usuarios se identifican externamente por UUID. |
| RNF11 | Resiliencia     | Mint no bloquea el pago   | Un fallo en el mint no revierte el registro del pago. Todos los errores se loguean. |
