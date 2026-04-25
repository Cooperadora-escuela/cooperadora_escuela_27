# Modelo Navegacional — Contextos Navegacionales
**Sistema:** Gestión de Cooperadora Escolar N°27

---

## Contextos definidos

| ID   | Nombre                  | Rol              | Descripción |
|------|-------------------------|------------------|-------------|
| CN01 | Acceso público          | Anónimo          | Solo permite el login. Sin acceso a ninguna otra sección. |
| CN02 | Panel Tesorero/Admin    | TES, ADMIN       | Acceso completo: usuarios, inscripciones, pagos, configuración. |
| CN03 | Panel Padre             | PAD              | Solo puede ver sus hijos y el historial de pagos de cada uno. |
| CN04 | Panel general           | PRES, SEC, REV, DOC, MIE | Solo lectura: puede ver listados de pagos e inscripciones. |

---

## Detalle de cada contexto

### CN01 — Acceso público
- Vista: Login
- Transición: al autenticarse exitosamente redirige según el rol:
  - TES/ADMIN → CN02
  - PAD → CN03
  - Resto → CN04

### CN02 — Panel Tesorero/Admin
Nodos disponibles:
- Gestión de usuarios (listar, crear, editar, dar de baja)
- Gestión de inscripciones (listar, crear, editar, eliminar)
- Registro de pagos (pago simple, múltiple, anual)
- Listado de pagos con filtros
- Configuración de cuotas mensuales
- Configuración de pago anual

### CN03 — Panel Padre
Nodos disponibles:
- Ver mis hijos (listado de alumnos vinculados)
- Ver detalle de hijo (inscripciones + historial de pagos)

### CN04 — Panel general (solo lectura)
Nodos disponibles:
- Listado de inscripciones
- Listado de pagos con filtros
