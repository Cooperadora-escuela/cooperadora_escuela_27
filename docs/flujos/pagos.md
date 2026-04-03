# Flujo de Pagos

## Actores
- **Padre/Socio**: realiza el pago en efectivo al Tesorero
- **Tesorero**: carga el pago en el sistema y entrega el recibo

---

> **Para visualizar los diagramas:** abrí el archivo `.mmd` correspondiente, seleccioná todo (Ctrl+A), copiá (Ctrl+C) y pegá en [mermaid.live](https://mermaid.live).
>
> | Diagrama | Archivo |
> |---|---|
> | Flujo principal | `pagos_flujo_principal.mmd` |
> | Casos especiales | `pagos_casos_especiales.mmd` |
> | Estado de deuda | `pagos_estado_deuda.mmd` |

---

## Flujo principal

```mermaid
flowchart TD
    A([Padre realiza el pago\nen efectivo]) --> B[Tesorero ingresa al sistema]
    B --> C{¿Qué tipo de pago?}

    C -->|Cuota mensual| D[Selecciona alumno + mes/es]
    C -->|Pago anual| E[Selecciona alumno + año]
    C -->|Donación| F[Ingresa monto libre]

    D --> G{¿El alumno tiene\ninscripción activa?}
    E --> G
    F --> G

    G -->|No| H[/Error: el alumno\nno está inscripto/]
    G -->|Sí| I{¿Ya existe ese\npago registrado?}

    I -->|Sí| J[/Error: pago duplicado/]
    I -->|No| K[Sistema registra el pago]

    K --> L[Se genera recibo de pago]
    L --> M([Tesorero entrega recibo al Padre])
```

---

## Casos especiales

```mermaid
flowchart TD
    A([Padre quiere pagar\nvarios meses juntos]) --> B[Tesorero usa\npago múltiple]
    B --> C[Selecciona alumno +\nrango de meses]
    C --> D[Sistema registra un\npago por cada mes]
    D --> E([Se genera recibo])

    F([Padre quiere pagar\ntodo el año junto]) --> G{¿La inscripción\nes modalidad anual?}
    G -->|No| H[/No permitido:\ncambiar modalidad\na mitad de año/]
    G -->|Sí| I[Tesorero usa\npago anual]
    I --> J[Sistema valida que\nexista ConfiguracionAnual]
    J --> K([Se genera recibo])
```

---

## Estado de deuda de un alumno

Un alumno figura como **deudor** cuando no existe registro de pago en la base de datos para un mes determinado. No hay un campo "debe" — la ausencia del registro es la deuda.

```mermaid
flowchart LR
    A[Consulta de pagos\npor alumno/mes] --> B{¿Existe registro\nde Pago?}
    B -->|Sí| C[Pagado]
    B -->|No| D[Sin pago registrado\npuede ser deuda o\npendiente de carga]
```
