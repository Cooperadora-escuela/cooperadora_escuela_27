# Modelo de Presentación — Vistas
**Sistema:** Gestión de Cooperadora Escolar N°27

---

## V01 — Login

```
┌─────────────────────────────────────┐
│     Cooperadora Escolar N°27        │
│                                     │
│  Email:    [_____________________]  │
│  Clave:    [_____________________]  │
│                                     │
│            [  Ingresar  ]           │
└─────────────────────────────────────┘
```
**Acceso:** Público  
**Acción:** POST /api/login/

---

## V02 — Dashboard Tesorero/Admin

```
┌─────────────────────────────────────────────────────┐
│  Cooperadora N°27          [Usuario: TES] [Salir]   │
├─────────────┬───────────────────────────────────────┤
│  MENÚ       │  Resumen                              │
│             │  ┌──────────┐ ┌──────────┐            │
│ Usuarios    │  │ Alumnos  │ │  Pagos   │            │
│ Inscripciones│ │    42    │ │  $ 8400  │            │
│ Pagos       │  └──────────┘ └──────────┘            │
│ Configuración│                                      │
└─────────────┴───────────────────────────────────────┘
```
**Acceso:** TES, ADMIN

---

## V03 — Mis Hijos (Padre)

```
┌─────────────────────────────────────────────────────┐
│  Cooperadora N°27          [Juan García] [Salir]    │
├─────────────────────────────────────────────────────┤
│  Mis hijos                                          │
│                                                     │
│  ┌─────────────────────────────────────────┐        │
│  │ Pedro García — 3° A — 2026              │ [Ver]  │
│  └─────────────────────────────────────────┘        │
│  ┌─────────────────────────────────────────┐        │
│  │ María García — 1° B — 2026              │ [Ver]  │
│  └─────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```
**Acceso:** PAD  
**Datos:** GET /api/mis-hijos/

---

## V04 — Vista Solo Lectura

```
┌─────────────────────────────────────────────────────┐
│  Cooperadora N°27          [Usuario] [Salir]        │
├─────────────┬───────────────────────────────────────┤
│  MENÚ       │  Contenido                            │
│             │                                       │
│ Inscripciones│  [Solo visualización]                │
│ Pagos       │                                       │
└─────────────┴───────────────────────────────────────┘
```
**Acceso:** PRES, SEC, REV, DOC, MIE

---

## V05 — Listado de Usuarios

```
┌─────────────────────────────────────────────────────┐
│  Usuarios                          [+ Crear usuario]│
├──────────┬──────────┬──────┬────────┬───────────────┤
│ Nombre   │ Apellido │ DNI  │  Rol   │  Acciones     │
├──────────┼──────────┼──────┼────────┼───────────────┤
│ Carlos   │ López    │12345 │ SOC    │ [Editar][Baja]│
│ Ana      │ Martínez │67890 │ PAD    │ [Editar][Baja]│
└──────────┴──────────┴──────┴────────┴───────────────┘
```
**Acceso:** TES, ADMIN  
**Datos:** GET /api/usuarios/

---

## V06 — Crear / Editar Usuario

```
┌─────────────────────────────────────┐
│  Crear Usuario                      │
│                                     │
│  Nombre:    [___________________]   │
│  Apellido:  [___________________]   │
│  DNI:       [___________________]   │
│  Email:     [___________________]   │
│  Teléfono:  [___________________]   │
│  Rol:       [▼ Seleccionar rol  ]   │
│                                     │
│  (si rol=SOCIO)                     │
│  Email padre: [_________________]   │
│                                     │
│       [Cancelar]  [Guardar]         │
└─────────────────────────────────────┘
```
**Acceso:** TES, ADMIN  
**Acción:** POST /api/usuarios/crear/ | PUT /api/usuarios/<uuid>/

---

## V07 — Listado de Inscripciones

```
┌─────────────────────────────────────────────────────────┐
│  Inscripciones                   [+ Nueva inscripción]  │
├──────────────┬──────┬──────┬───────────┬────────────────┤
│  Alumno      │ Grado│ Año  │ Modalidad │  Acciones      │
├──────────────┼──────┼──────┼───────────┼────────────────┤
│ Pedro García │ 3° A │ 2026 │ Mensual   │ [Editar][Elim] │
│ María García │ 1° B │ 2026 │ Anual     │ [Editar][Elim] │
└──────────────┴──────┴──────┴───────────┴────────────────┘
```
**Acceso:** TES/ADMIN (escritura), todos (lectura)  
**Datos:** GET /api/inscripciones/

---

## V08 — Crear / Editar Inscripción

```
┌─────────────────────────────────────┐
│  Nueva Inscripción                  │
│                                     │
│  Alumno:    [▼ Buscar alumno    ]   │
│  Grado:     [▼ Seleccionar grado]   │
│  Año:       [2026               ]   │
│  Modalidad: [▼ Mensual / Anual  ]   │
│  Observ.:   [___________________]   │
│                                     │
│       [Cancelar]  [Guardar]         │
└─────────────────────────────────────┘
```

---

## V09 — Listado de Pagos

```
┌──────────────────────────────────────────────────────────────┐
│  Pagos             Filtros: Mes [▼]  Año [2026]  [Buscar]    │
│                                      [Pago simple]           │
│                                      [Pago múltiple]         │
│                                      [Pago anual]            │
├───────────────┬──────────┬─────┬──────┬────────┬────────────┤
│  Alumno       │   Tipo   │ Mes │ Año  │ Monto  │  Fecha     │
├───────────────┼──────────┼─────┼──────┼────────┼────────────┤
│ Pedro García  │ Mensual  │ Mar │ 2026 │ $2500  │ 01/03/2026 │
│ María García  │ Anual    │  -  │ 2026 │ $20000 │ 05/03/2026 │
│ Carlos López  │ Donación │  -  │ 2026 │ $500   │ 10/03/2026 │
└───────────────┴──────────┴─────┴──────┴────────┴────────────┘
```
**Datos:** GET /api/pagos/?mes=3&anio=2026

---

## V10 — Registrar Pago Simple

```
┌─────────────────────────────────────┐
│  Pago Simple                        │
│                                     │
│  Alumno (DNI): [_________________]  │
│  Mes:          [▼ Marzo          ]  │
│  Año:          [2026             ]  │
│  Monto:        [_________________]  │
│                                     │
│  Cuota del mes: $2500               │
│                                     │
│       [Cancelar]  [Registrar]       │
└─────────────────────────────────────┘
```
**Acción:** POST /api/pagos/pago-simple/

---

## V11 — Registrar Pago Múltiple

```
┌─────────────────────────────────────┐
│  Pago Múltiple                      │
│                                     │
│  Alumno (DNI): [_________________]  │
│  Año:          [2026             ]  │
│  Meses:        [✓] Mar  [✓] Abr     │
│                [ ] May  [ ] Jun     │
│  Monto total:  [_________________]  │
│                                     │
│  Total cuotas: $5000                │
│                                     │
│       [Cancelar]  [Registrar]       │
└─────────────────────────────────────┘
```
**Acción:** POST /api/pagos/pago-multiple/

---

## V12 — Registrar Pago Anual

```
┌─────────────────────────────────────┐
│  Pago Anual                         │
│                                     │
│  Alumno (DNI): [_________________]  │
│  Año:          [2026             ]  │
│  Monto:        [_________________]  │
│                                     │
│  Valor anual configurado: $20000    │
│                                     │
│       [Cancelar]  [Registrar]       │
└─────────────────────────────────────┘
```
**Acción:** POST /api/pagos/pago-anual/

---

## V13 — Configuración

```
┌─────────────────────────────────────────────────────┐
│  Configuración                                      │
│                                                     │
│  Cuotas mensuales — Año 2026                        │
│  ┌──────┬────────┬────────────┐                     │
│  │ Mes  │ Monto  │  Acciones  │                     │
│  ├──────┼────────┼────────────┤                     │
│  │ Mar  │ $2500  │ [Editar]   │                     │
│  │ Abr  │ $2500  │ [Editar]   │                     │
│  └──────┴────────┴────────────┘                     │
│                                                     │
│  Pago anual 2026: $20000        [Editar]            │
└─────────────────────────────────────────────────────┘
```

---

## V14 — Detalle de Hijo (vista Padre)

```
┌─────────────────────────────────────────────────────┐
│  Pedro García — 3° A — 2026                         │
│                                                     │
│  Modalidad: Mensual                                 │
│                                                     │
│  Estado de cuotas:                                  │
│  Mar ✅  Abr ✅  May ⏳  Jun ⏳  Jul ⏳             │
│  Ago ⏳  Sep ⏳  Oct ⏳  Nov ⏳  Dic ⏳             │
│                                                     │
│  Historial de pagos:                                │
│  ┌───────────┬──────────┬────────┬──────────────┐   │
│  │  Fecha    │   Tipo   │  Mes   │    Monto     │   │
│  ├───────────┼──────────┼────────┼──────────────┤   │
│  │ 01/03/26  │ Mensual  │ Marzo  │   $2500      │   │
│  │ 05/04/26  │ Mensual  │ Abril  │   $2500      │   │
│  └───────────┴──────────┴────────┴──────────────┘   │
└─────────────────────────────────────────────────────┘
```
**Datos:** GET /api/mis-hijos/ (incluye inscripciones y pagos)
