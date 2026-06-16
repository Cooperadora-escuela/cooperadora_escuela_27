# Modelo Navegacional — Contextos Navegacionales
**Sistema:** CooperaApp — Gestión de Cooperadoras Escolares (SaaS Multi-tenant)

---

## Contextos definidos

| ID   | Nombre                    | Rol                  | Ruta base         | Descripción |
|------|---------------------------|----------------------|-------------------|-------------|
| CN00 | Landing pública           | Anónimo              | `/`               | Página de presentación. Acceso a login y registro de nueva cooperadora. |
| CN01 | Registro cooperadora      | Anónimo              | `/register`       | Formulario de registro de nueva cooperadora. Sin autenticación. |
| CN02 | Activación cooperadora    | Anónimo (con token)  | `/{slug}/activar` | Formulario para crear el usuario ADMIN de la cooperadora. Token de un solo uso. |
| CN03 | Login cooperadora         | Anónimo              | `/{slug}/login`   | Login dentro del contexto del slug. |
| CN04 | Panel Admin/Tesorero      | ADMIN, TES           | `/{slug}/`        | Acceso completo: usuarios, inscripciones, pagos, configuración, publicaciones. |
| CN05 | Panel Secretario          | SEC                  | `/{slug}/`        | Publicaciones: crear, editar, eliminar, listar. |
| CN06 | Panel Padre               | PAD                  | `/{slug}/`        | Ver hijos, estado de cuenta, publicaciones. Wallet reveal-once al primer login. |
| CN07 | Panel general             | Otros roles          | `/{slug}/`        | Solo lectura: publicaciones. |
| CN08 | Platform Admin            | superuser            | `/admin/`         | Django Admin. Gestión de cooperadoras, aprobación, acciones de suscripción. |

---

## Detalle de cada contexto

### CN00 — Landing pública
- Vista: Home sin sesión
- Links: → CN01 (Registrar cooperadora), → CN03 (Login)

### CN01 — Registro cooperadora
- Vista: Formulario de registro
- Acción: POST crea cooperadora en PENDING y notifica al platform admin
- Transición: → página de confirmación "Tu solicitud fue enviada"

### CN02 — Activación cooperadora
- Vista: Formulario de activación (nombre, apellido, DNI, contraseña)
- Condición: token UUID válido y no usado
- Acción: crea usuario ADMIN, invalida token
- Transición: → CN03 (login)

### CN03 — Login cooperadora
- Vista: Formulario de login
- Condición: cooperadora con `tiene_acceso=True` (TRIAL o ACTIVE)
- Transición al autenticarse:
  - ADMIN/TES → CN04
  - SEC → CN05
  - PAD → CN06
  - Otros → CN07

### CN04 — Panel Admin/Tesorero
Nodos disponibles:
- Dashboard con cards de acceso rápido
- Gestión de usuarios (listar, crear PAD/SOC, editar, dar de baja)
- Gestión de inscripciones
- Registro de pagos (simple, múltiple, anual)
- Listado de pagos con filtros
- Configuración de cuotas mensuales y pago anual
- Publicaciones (heredado de SEC)

### CN05 — Panel Secretario
Nodos disponibles:
- Publicaciones: crear, editar, eliminar, listar

### CN06 — Panel Padre
Nodos disponibles:
- Home con WalletRevealBanner (si `wallet_address` existe y `key_revealed=False`)
- Mis hijos (listado con link a estado de cuenta)
- Estado de cuenta (cuotas del año por hijo)
- Publicaciones (solo lectura)

### CN07 — Panel general
Nodos disponibles:
- Publicaciones (solo lectura)

### CN08 — Platform Admin (Django Admin)
Nodos disponibles:
- Listado y detalle de cooperadoras
- Acciones: habilitar trial, activar anualidad, suspender, enviar bienvenida
- Listado de usuarios (todos los tenants)
