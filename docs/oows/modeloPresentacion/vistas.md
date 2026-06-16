# Modelo de Presentación — Vistas
**Sistema:** CooperaApp — Gestión de Cooperadoras Escolares (SaaS Multi-tenant)

---

## V00 — Landing pública

```
┌─────────────────────────────────────────────────┐
│          CooperaApp                [Ingresar]   │
├─────────────────────────────────────────────────┤
│                                                 │
│   Gestión digital para cooperadoras escolares   │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │   Para Padres    │  │  Área Admin      │     │
│  │  Ver cuotas e    │  │  Pagos, alumnos  │     │
│  │  hijos           │  │  y publicaciones │     │
│  │  [Ingresar]      │  │  [Acceder]       │     │
│  └──────────────────┘  └──────────────────┘     │
│                                                 │
│  ¿Sos una cooperadora? [Registrate aquí]        │
└─────────────────────────────────────────────────┘
```
**Acceso:** Público | **Ruta:** `/`

---

## V01 — Registro de cooperadora

```
┌─────────────────────────────────────┐
│   Registrá tu cooperadora           │
│                                     │
│  Número de escuela: [____________]  │
│  Nombre:            [____________]  │
│  Nombre contacto:   [____________]  │
│  Email contacto:    [____________]  │
│  Teléfono:          [____________]  │
│                                     │
│         [Enviar solicitud]          │
│                                     │
│  Tu solicitud será revisada         │
│  en las próximas 24-48 hs.          │
└─────────────────────────────────────┘
```
**Acceso:** Público | **Ruta:** `/register` | **Acción:** POST `/api/register/`

---

## V02 — Activación de cooperadora

```
┌─────────────────────────────────────┐
│  Activar cuenta — {nombre coop}     │
│                                     │
│  Creá tu usuario administrador      │
│                                     │
│  Nombre:      [___________________] │
│  Apellido:    [___________________] │
│  DNI:         [___________________] │
│  Contraseña:  [___________________] │
│  Confirmar:   [___________________] │
│                                     │
│         [Crear cuenta]              │
└─────────────────────────────────────┘
```
**Acceso:** Público con token | **Ruta:** `/{slug}/activar?token=...` | **Acción:** POST `/api/activar/{token}/`

---

## V03 — Login

```
┌─────────────────────────────────────┐
│   {Nombre cooperadora} N°{numero}   │
│                                     │
│  Email:    [_____________________]  │
│  Clave:    [_____________________]  │
│                                     │
│            [  Ingresar  ]           │
└─────────────────────────────────────┘
```
**Acceso:** Público | **Ruta:** `/{slug}/login` | **Acción:** POST `/api/login/`

---

## V04 — Dashboard Admin/Tesorero

```
┌─────────────────────────────────────────────────────┐
│  {Nombre coop} N°{num}     [Admin: Juan] [Salir]    │
├─────────────────────────────────────────────────────┤
│  Hola, Juan — Panel de administración               │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Pagos   │  │ Usuarios │  │ + Nuevo  │           │
│  │          │  │          │  │ usuario  │           │
│  │ [Ir]     │  │ [Ver]    │  │ [Ir]     │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│  ┌──────────┐  ┌──────────┐                         │
│  │  Public. │  │ Config.  │                         │
│  │ [Gestionar]│ │ [Ir]    │                         │
│  └──────────┘  └──────────┘                         │
└─────────────────────────────────────────────────────┘
```
**Acceso:** ADMIN, TES | **Ruta:** `/{slug}/`

---

## V05 — Dashboard Padre (con WalletRevealBanner)

```
┌─────────────────────────────────────────────────────┐
│  {Nombre coop}             [Walter] [Salir]         │
├─────────────────────────────────────────────────────┤
│  Hola, Walter — Tu espacio en la cooperadora        │
│                                                     │
│  ╔═══════════════════════════════════════════╗      │
│  ║  🪙 Tu wallet COOP está lista             ║      │
│  ║  Cada cuota genera 1 token COOP.          ║      │
│  ║  Te la mostramos una sola vez.            ║      │
│  ║                   [Ver mi wallet]         ║      │
│  ╚═══════════════════════════════════════════╝      │
│  (banner visible solo si !key_revealed)             │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Mis hijos   │  │ Estado de    │  │ Public.  │  │
│  │              │  │ cuenta       │  │          │  │
│  │ [Ver]        │  │ [Ver]        │  │ [Ver]    │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```
**Acceso:** PAD | **Ruta:** `/{slug}/`

---

## V06 — Wallet Reveal (modal/banner expandido)

```
┌─────────────────────────────────────────────────────┐
│  ⚠️ Guardá tu clave privada ahora.                  │
│  No la vamos a mostrar de nuevo.                    │
├─────────────────────────────────────────────────────┤
│  Dirección (pública)                                │
│  0x8a5936B7D01c7A7b7f...          [Copiar]          │
│                                                     │
│  Clave privada — NO COMPARTIR                       │
│  0xd6b974f4949b5b1bbf...          [Copiar]          │
│                                                     │
│  Para ver tu saldo en MetaMask: importá la cuenta   │
│  con la clave privada → agregá token COOP           │
│  en Base Sepolia: 0x0b5cca51...                     │
└─────────────────────────────────────────────────────┘
```
**Acceso:** PAD (solo si `!key_revealed`) | **Datos:** GET `/api/mi-wallet/`

---

## V07 — Mis Hijos (PAD)

```
┌─────────────────────────────────────────────────────┐
│  Mis hijos                                          │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │ 👤 Pedro García                         │        │
│  │ 3° A — 2026 — Mensual                   │        │
│  │                  [Ver estado de cuenta →]│       │
│  └─────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────┐        │
│  │ 👤 María García                         │        │
│  │ 1° B — 2026 — Mensual                   │        │
│  │                  [Ver estado de cuenta →]│       │
│  └─────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```
**Acceso:** PAD | **Ruta:** `/{slug}/mis-hijos` | **Datos:** GET `/api/mis-hijos/`

---

## V08 — Estado de Cuenta (PAD)

```
┌─────────────────────────────────────────────────────┐
│  Estado de cuenta — Año [2026 ▼]                    │
│                                                     │
│  Cuotas pagas:    Mar ✅  Abr ✅                    │
│  Cuotas pendientes: May ⏳ Jun ⏳ Jul ⏳ ...         │
│  Donaciones:      $500                              │
│                                                     │
│  Historial:                                         │
│  ┌───────────┬──────────┬────────┬──────────────┐   │
│  │  Fecha    │   Tipo   │  Mes   │    Monto     │   │
│  ├───────────┼──────────┼────────┼──────────────┤   │
│  │ 01/03/26  │ Mensual  │ Marzo  │   $2500      │   │
│  │ 05/04/26  │ Mensual  │ Abril  │   $2500      │   │
│  └───────────┴──────────┴────────┴──────────────┘   │
└─────────────────────────────────────────────────────┘
```
**Acceso:** PAD | **Ruta:** `/{slug}/estado-cuenta` | **Datos:** GET `/api/estado-cuenta/?anio=2026`

---

## V09 — Listado de Usuarios (Admin/TES)

```
┌─────────────────────────────────────────────────────┐
│  Usuarios                          [+ Crear usuario]│
├──────────┬──────────┬──────┬────────┬───────────────┤
│ Nombre   │ Apellido │ DNI  │  Rol   │  Acciones     │
├──────────┼──────────┼──────┼────────┼───────────────┤
│ Carlos   │ López    │12345 │ SOC    │ [Editar][Baja]│
│ Walter   │ Frías    │67890 │ PAD    │ [Editar][Baja]│
└──────────┴──────────┴──────┴────────┴───────────────┘
```
**Acceso:** TES, ADMIN | **Ruta:** `/{slug}/usuarios` | **Datos:** GET `/api/usuarios/`

---

## V10 — Crear / Editar Usuario

```
┌────────────────────────────────────────────┐
│  Crear Usuario                             │
│                                            │
│  Tipo: [● Padre/Tutor ○ Alumno ○ Miembro] │
│                                            │
│  Nombre:    [___________________]          │
│  Apellido:  [___________________]          │
│  DNI:       [___________________]          │
│                                            │
│  (si Padre/Tutor)                          │
│  Email:     [___________________]          │
│  Contraseña:[___________________]          │
│                                            │
│  (si Alumno)                               │
│  DNI del padre: [________________]         │
│  Grado:     [▼ Seleccionar grado ]         │
│  Año:       [2026               ]          │
│  Modalidad: [▼ Mensual / Anual  ]          │
│                                            │
│       [Cancelar]  [Guardar]               │
└────────────────────────────────────────────┘
```
**Acceso:** TES, ADMIN | **Acción:** POST `/api/usuarios/crear/` | PUT `/api/usuarios/<uuid>/`

---

## V11 — Listado de Pagos

```
┌──────────────────────────────────────────────────────────────┐
│  Pagos             Filtros: Mes [▼]  Año [2026]  [Buscar]    │
│                              [Pago simple] [Múltiple] [Anual]│
├───────────────┬──────────┬─────┬──────┬────────┬────────────┤
│  Alumno       │   Tipo   │ Mes │ Año  │ Monto  │  Token     │
├───────────────┼──────────┼─────┼──────┼────────┼────────────┤
│ Pedro García  │ Mensual  │ Mar │ 2026 │ $2500  │ ✅ COOP    │
│ Pedro García  │ Mensual  │ Abr │ 2026 │ $2500  │ ✅ COOP    │
└───────────────┴──────────┴─────┴──────┴────────┴────────────┘
```
**Acceso:** TES, ADMIN | **Ruta:** `/{slug}/pagos` | **Datos:** GET `/api/pagos/`

---

## V12 — Registrar Pago Simple

```
┌─────────────────────────────────────┐
│  Pago Simple                        │
│                                     │
│  Alumno:  [▼ Seleccionar alumno  ]  │
│  Mes:     [▼ Marzo               ]  │
│  Año:     [2026                  ]  │
│  Monto:   [_____________________]   │
│                                     │
│  Cuota del mes: $2500               │
│                                     │
│       [Cancelar]  [Registrar]       │
└─────────────────────────────────────┘
```
**Acción:** POST `/api/pagos/pago-simple/`

---

## V13 — Registrar Pago Múltiple

```
┌─────────────────────────────────────┐
│  Pago Múltiple                      │
│                                     │
│  Alumno:  [▼ Seleccionar alumno  ]  │
│  Año:     [2026                  ]  │
│  Meses:   [✓] Mar  [✓] Abr          │
│           [ ] May  [ ] Jun          │
│  Monto total: [__________________]  │
│                                     │
│  Total cuotas seleccionadas: $5000  │
│                                     │
│       [Cancelar]  [Registrar]       │
└─────────────────────────────────────┘
```
**Acción:** POST `/api/pagos/pago-multiple/`

---

## V14 — Registrar Pago Anual

```
┌─────────────────────────────────────┐
│  Pago Anual                         │
│                                     │
│  Alumno:  [▼ Seleccionar alumno  ]  │
│  Año:     [2026                  ]  │
│  Monto:   [_____________________]   │
│                                     │
│  Valor anual configurado: $20000    │
│                                     │
│       [Cancelar]  [Registrar]       │
└─────────────────────────────────────┘
```
**Acción:** POST `/api/pagos/pago-anual/`

---

## V15 — Configuración

```
┌─────────────────────────────────────────────────────┐
│  Configuración — Año 2026                           │
│                                                     │
│  Cuotas mensuales                                   │
│  ┌──────┬────────┬────────────┐                     │
│  │ Mes  │ Monto  │  Acciones  │                     │
│  ├──────┼────────┼────────────┤                     │
│  │ Mar  │ $2500  │ [Editar]   │                     │
│  │ Abr  │ $2500  │ [Editar]   │                     │
│  └──────┴────────┴────────────┘   [+ Agregar mes]   │
│                                                     │
│  Pago anual 2026: $20000          [Editar]          │
└─────────────────────────────────────────────────────┘
```
