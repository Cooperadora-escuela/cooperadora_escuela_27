# Modelo Navegacional — Enlaces Navegacionales
**Sistema:** CooperaApp — Gestión de Cooperadoras Escolares (SaaS Multi-tenant)

---

## Diagrama de flujo

```
[Anónimo]
    │
    ▼
[V00 Landing /]
    ├──► [V01 Registro /register]
    │        └──► Confirmación "solicitud enviada"
    │
    └──► [V02 Login /{slug}/login]
             │
             ├── ADMIN/TES ──► [V03 Dashboard Admin/TES]
             ├── SEC       ──► [V04 Dashboard SEC]
             ├── PAD       ──► [V05 Dashboard PAD]
             └── otros     ──► [V06 Dashboard general]

[V_Activar /{slug}/activar?token=...]  (llegada desde email)
    └──► [V02 Login]  (tras crear usuario ADMIN)

[V03 Dashboard Admin/TES]
    ├──► [V07 Listado Usuarios]
    │        └──► [V08 Crear/Editar Usuario]
    ├──► [V09 Listado Inscripciones]
    │        └──► [V10 Crear/Editar Inscripción]
    ├──► [V11 Listado Pagos]
    │        ├──► [V12 Pago Simple]
    │        ├──► [V13 Pago Múltiple]
    │        └──► [V14 Pago Anual]
    ├──► [V15 Configuración]
    └──► [V16 Publicaciones]
             └──► [V17 Crear/Editar Publicación]

[V04 Dashboard SEC]
    └──► [V16 Publicaciones]
             └──► [V17 Crear/Editar Publicación]

[V05 Dashboard PAD]
    ├── (si !key_revealed) ──► [V18 Wallet Reveal Banner]
    │                              └──► muestra address + private key once
    ├──► [V19 Mis Hijos]
    │        └──► [V20 Estado de Cuenta /{slug}/estado-cuenta]
    └──► [V16 Publicaciones] (solo lectura)

[V06 Dashboard general]
    └──► [V16 Publicaciones] (solo lectura)

Todos los contextos autenticados
    └──► [V02 Login] (logout)
```

---

## Tabla de enlaces

| ID   | Origen                  | Destino                   | Condición                        |
|------|-------------------------|---------------------------|----------------------------------|
| EN01 | V00 Landing             | V01 Registro              | clic "Registrar cooperadora"     |
| EN02 | V00 Landing             | V02 Login                 | clic "Ingresar"                  |
| EN03 | Email de activación     | V_Activar                 | token UUID válido                |
| EN04 | V_Activar               | V02 Login                 | usuario ADMIN creado             |
| EN05 | V02 Login               | V03 Dashboard Admin/TES   | rol = ADMIN o TES                |
| EN06 | V02 Login               | V04 Dashboard SEC         | rol = SEC                        |
| EN07 | V02 Login               | V05 Dashboard PAD         | rol = PAD                        |
| EN08 | V02 Login               | V06 Dashboard general     | otro rol                         |
| EN09 | V03 Dashboard           | V07 Listado Usuarios      | autenticado ADMIN/TES            |
| EN10 | V07 Listado Usuarios    | V08 Crear Usuario         | acción crear                     |
| EN11 | V07 Listado Usuarios    | V08 Editar Usuario        | acción editar                    |
| EN12 | V03 Dashboard           | V11 Listado Pagos         | autenticado ADMIN/TES            |
| EN13 | V11 Listado Pagos       | V12 Pago Simple           | acción registrar                 |
| EN14 | V11 Listado Pagos       | V13 Pago Múltiple         | acción registrar                 |
| EN15 | V11 Listado Pagos       | V14 Pago Anual            | acción registrar                 |
| EN16 | V03 Dashboard           | V15 Configuración         | autenticado ADMIN/TES            |
| EN17 | V05 Dashboard PAD       | V18 Wallet Reveal         | wallet_address y !key_revealed   |
| EN18 | V18 Wallet Reveal       | V05 Dashboard PAD         | key_revealed = True              |
| EN19 | V05 Dashboard PAD       | V19 Mis Hijos             | clic card                        |
| EN20 | V19 Mis Hijos           | V20 Estado de Cuenta      | clic "Ver estado de cuenta"      |
| EN21 | Cualquier vista auth    | V02 Login                 | logout                           |
