# Diagrama de Clases — Modelo Conceptual
**Sistema:** CooperaApp — Gestión de Cooperadoras Escolares (SaaS Multi-tenant)

---

## Diagrama

```
┌─────────────────────────────────────────┐
│               Cooperadora               │
├─────────────────────────────────────────┤
│ id: int                                 │
│ numero_escuela: int (único)             │
│ nombre: str                             │
│ slug: str (único)                       │
│ dao_address: str (nullable)             │
│ subscription_status: SubscriptionStatus │
│ trial_until: date (nullable)            │
│ subscription_expiry: date (nullable)    │
│ activation_token: UUID (nullable)       │
│ nombre_contacto: str                    │
│ email_contacto: str                     │
│ creada_en: datetime                     │
├─────────────────────────────────────────┤
│ + tiene_acceso: bool (property)         │
└──────────────┬──────────────────────────┘
               │ 1
               │ cooperadora (FK)
               │ 0..*
┌──────────────▼──────────────────────────┐
│                Usuario                  │
├─────────────────────────────────────────┤
│ uuid: UUID                              │
│ nombre: str                             │
│ apellido: str                           │
│ dni: str (único por cooperadora)        │
│ email: str (único global, nullable)     │
│ telefono: str                           │
│ rol: Rol                                │
│ activo: bool                            │
│ fecha_registro: datetime                │
│ wallet_address: str (nullable)          │
│ wallet_private_key_encrypted: text (nullable) │
│ key_revealed: bool                      │
├─────────────────────────────────────────┤
│ + __str__()                             │
└──────────────┬──────────────────────────┘
               │ padre (FK self, rol=PAD)
               │ 0..*
          (hijos: SOC)

┌──────────────────────┐   ┌──────────────────────────────┐
│        Grado         │   │          Inscripcion         │
├──────────────────────┤   ├──────────────────────────────┤
│ cooperadora → Coop.  │   │ cooperadora → Cooperadora    │
│ numero: int (1-7)    │◄──│ usuario → Usuario (SOC)      │
│ letra: str (opt)     │   │ grado → Grado                │
├──────────────────────┤   │ anio: int                    │
│ + __str__()          │   │ activa: bool                 │
└──────────────────────┘   │ modalidad: mensual|anual     │
                           │ fecha_inscripcion: datetime  │
                           ├──────────────────────────────┤
                           │ + clean()                    │
                           └──────────────┬───────────────┘
                                          │ 1
                                          │ 0..*
                           ┌──────────────▼───────────────┐
                           │             Pago             │
                           ├──────────────────────────────┤
                           │ cooperadora → Cooperadora    │
                           │ inscripcion → Inscripcion    │
                           │ tipo: mensual|anual|donacion │
                           │ mes: int (nullable)          │
                           │ anio: int                    │
                           │ monto: decimal               │
                           │ fecha_pago: datetime         │
                           │ observaciones: str           │
                           │ token_minteado: bool         │
                           │ token_mint_tx: str (nullable)│
                           ├──────────────────────────────┤
                           │ + clean()                    │
                           └──────────────────────────────┘

┌──────────────────────────┐   ┌──────────────────────┐
│       CuotaMensual       │   │  ConfiguracionAnual  │
├──────────────────────────┤   ├──────────────────────┤
│ cooperadora → Cooperadora│   │ cooperadora → Coop.  │
│ anio: int                │   │ anio: int            │
│ mes: int                 │   │ monto: decimal       │
│ monto: decimal           │   │ activa: bool         │
│ activa: bool             │   └──────────────────────┘
└──────────────────────────┘

┌─────────────────────────────────────────┐
│              Publicacion                │
├─────────────────────────────────────────┤
│ cooperadora → Cooperadora               │
│ titulo: str                             │
│ contenido: text                         │
│ tipo: noticia|agenda|novedad            │
│ autor → Usuario (rol=SEC o ADMIN)       │
│ fecha_publicacion: datetime             │
│ imagen_portada: ImageField (nullable)   │
│ activa: bool                            │
└─────────────────────────────────────────┘
```

---

## Enumeraciones

### SubscriptionStatus
| Código    | Descripción                        |
|-----------|------------------------------------|
| PENDING   | Registrada, esperando aprobación   |
| TRIAL     | En período de prueba (30 días)     |
| ACTIVE    | Suscripción anual activa           |
| EXPIRED   | Suscripción vencida                |
| SUSPENDED | Suspendida por el platform admin   |

### Rol
| Código | Nombre        |
|--------|---------------|
| ADMIN  | Administrador (por cooperadora) |
| TES    | Tesorero      |
| SEC    | Secretario    |
| SOC    | Socio (alumno)|
| PAD    | Padre/Tutor   |

### TipoPago
| Código   | Descripción  |
|----------|--------------|
| mensual  | Cuota mensual|
| anual    | Pago anual   |
| donacion | Donación     |

---

## Restricciones de integridad

- `Usuario`: unique_together `(cooperadora, dni)` — mismo DNI puede existir en distintas cooperadoras
- `Grado`: unique_together `(cooperadora, numero, letra)`
- `Inscripcion`: unique_together `(usuario, anio)` — un alumno, una inscripción por año
- `CuotaMensual`: unique_together `(cooperadora, anio, mes)`
- `ConfiguracionAnual`: unique_together `(cooperadora, anio)`
- `Pago mensual`: unique `(inscripcion, tipo, mes, anio)`
- `Pago anual`: unique `(inscripcion)` donde tipo=anual
