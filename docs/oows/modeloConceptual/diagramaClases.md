# Diagrama de Clases — Modelo Conceptual
**Sistema:** Gestión de Cooperadora Escolar N°27

---

## Diagrama

```
┌─────────────────────────────────────┐
│              Usuario                │
├─────────────────────────────────────┤
│ uuid: UUID                          │
│ nombre: str                         │
│ apellido: str                       │
│ dni: str (único)                    │
│ email: str (único, opcional)        │
│ telefono: str                       │
│ rol: Rol                            │
│ activo: bool                        │
│ fecha_registro: datetime            │
├─────────────────────────────────────┤
│ + __str__()                         │
└──────────────┬──────────────────────┘
               │ padre (FK self, rol=PAD)
               │ 0..*
               ▼
          (hijos: SOCIO)

┌──────────────────┐        ┌────────────────────────────┐
│      Grado       │        │        Inscripcion         │
├──────────────────┤        ├────────────────────────────┤
│ numero: int(1-7) │        │ usuario → Usuario (SOCIO)  │
│ letra: str (opt) │◄───────│ grado → Grado              │
├──────────────────┤        │ anio: int                  │
│ + __str__()      │        │ activa: bool               │
└──────────────────┘        │ modalidad: mensual|anual   │
                            │ fecha_inscripcion: datetime│
                            │ observaciones: str         │
                            ├────────────────────────────┤
                            │ + clean()                  │
                            └────────────┬───────────────┘
                                         │ 1
                                         │
                                         │ 0..*
                            ┌────────────▼───────────────┐
                            │           Pago             │
                            ├────────────────────────────┤
                            │ inscripcion → Inscripcion  │
                            │ tipo: mensual|anual|donac. │
                            │ mes: int (solo mensual)    │
                            │ anio: int                  │
                            │ monto: decimal             │
                            │ fecha_pago: datetime       │
                            │ observaciones: str         │
                            ├────────────────────────────┤
                            │ + clean()                  │
                            └────────────────────────────┘

┌──────────────────────┐    ┌──────────────────────┐
│    CuotaMensual      │    │  ConfiguracionAnual  │
├──────────────────────┤    ├──────────────────────┤
│ anio: int            │    │ anio: int (único)    │
│ mes: int             │    │ monto: decimal       │
│ monto: decimal       │    │ activa: bool         │
│ activa: bool         │    └──────────────────────┘
└──────────────────────┘
```

---

## Enumeraciones

### Rol
| Código | Nombre              |
|--------|---------------------|
| ADMIN  | Administrador       |
| PRES   | Presidente          |
| TES    | Tesorero            |
| SEC    | Secretario          |
| REV    | Revisor de Cuentas  |
| DOC    | Docente             |
| SOC    | Socio (alumno)      |
| PAD    | Padre/Tutor         |
| MIE    | Miembro Cooperadora |

### TipoPago
| Código   | Descripción    |
|----------|----------------|
| mensual  | Cuota mensual  |
| anual    | Pago anual     |
| donacion | Donación       |

### Modalidad Inscripción
| Código  | Descripción |
|---------|-------------|
| mensual | Mensual     |
| anual   | Anual       |

---

## Restricciones de integridad

- `Inscripcion`: unique_together `(usuario, anio)` — un alumno, una inscripción por año
- `CuotaMensual`: unique_together `(anio, mes)`
- `Pago mensual`: unique `(inscripcion, tipo, mes, anio)` — no duplicar mes
- `Pago anual`: unique `(inscripcion)` donde tipo=anual — un solo pago anual por inscripción
