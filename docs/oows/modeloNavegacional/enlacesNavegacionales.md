# Modelo Navegacional — Enlaces Navegacionales
**Sistema:** Gestión de Cooperadora Escolar N°27

---

## Diagrama de flujo

```
[Anónimo]
    │
    ▼
[V01 Login] ──────────────────────────────────────────────────┐
    │                                                          │
    ├── rol TES/ADMIN ──► [V02 Dashboard Tesorero]            │
    ├── rol PAD       ──► [V03 Mis Hijos]                     │
    └── otro rol      ──► [V04 Vista Solo Lectura]            │
                                                              │
[V02 Dashboard Tesorero]                                      │
    ├──► [V05 Listado de Usuarios]                            │
    │        └──► [V06 Crear/Editar Usuario]                  │
    ├──► [V07 Listado de Inscripciones]                       │
    │        └──► [V08 Crear/Editar Inscripción]              │
    ├──► [V09 Listado de Pagos]                               │
    │        ├──► [V10 Registrar Pago Simple]                 │
    │        ├──► [V11 Registrar Pago Múltiple]               │
    │        └──► [V12 Registrar Pago Anual]                  │
    └──► [V13 Configuración]                                  │
             ├──► Cuotas mensuales                            │
             └──► Pago anual                                  │
                                                              │
[V03 Mis Hijos] (PAD)                                         │
    └──► [V14 Detalle Hijo] (inscripciones + pagos)           │
                                                              │
[V04 Vista Solo Lectura]                                      │
    ├──► Listado de inscripciones                             │
    └──► Listado de pagos                                     │
                                                              │
Todos los contextos ─────────────────────────────────────────►│
    └──► [V01 Login] (logout)
```

---

## Tabla de enlaces

| ID   | Origen             | Destino                  | Condición              |
|------|--------------------|--------------------------|------------------------|
| EN01 | V01 Login          | V02 Dashboard Tesorero   | rol = TES o ADMIN      |
| EN02 | V01 Login          | V03 Mis Hijos            | rol = PAD              |
| EN03 | V01 Login          | V04 Solo Lectura         | otro rol               |
| EN04 | V02 Dashboard      | V05 Listado Usuarios     | autenticado TES/ADMIN  |
| EN05 | V05 Listado Usuarios | V06 Crear Usuario      | acción crear           |
| EN06 | V05 Listado Usuarios | V06 Editar Usuario     | acción editar          |
| EN07 | V02 Dashboard      | V07 Listado Inscripciones| autenticado TES/ADMIN  |
| EN08 | V07 Listado Inscripciones | V08 Crear Inscripción | acción crear       |
| EN09 | V02 Dashboard      | V09 Listado Pagos        | autenticado TES/ADMIN  |
| EN10 | V09 Listado Pagos  | V10 Pago Simple          | acción registrar       |
| EN11 | V09 Listado Pagos  | V11 Pago Múltiple        | acción registrar       |
| EN12 | V09 Listado Pagos  | V12 Pago Anual           | acción registrar       |
| EN13 | V02 Dashboard      | V13 Configuración        | autenticado TES/ADMIN  |
| EN14 | V03 Mis Hijos      | V14 Detalle Hijo         | seleccionar hijo       |
| EN15 | Cualquier vista    | V01 Login                | logout                 |
