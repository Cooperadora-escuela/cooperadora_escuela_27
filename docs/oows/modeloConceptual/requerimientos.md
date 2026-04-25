# Modelo Conceptual — Requerimientos
**Sistema:** Gestión de Cooperadora Escolar N°27  
**Metodología:** OOWS (Object Oriented Approach for Web Solutions Modeling)

---

## 1. Requerimientos Funcionales

### Base

| ID    | Nombre                        | Descripción |
|-------|-------------------------------|-------------|
| RF01  | Autenticar usuario            | El sistema permite el ingreso mediante email y clave. Solo usuarios activos pueden acceder. Devuelve tokens JWT (access + refresh). |
| RF02  | Crear usuario                 | Permite registrar un nuevo usuario con nombre, apellido, DNI, email, teléfono y rol. Si el rol es PADRE requiere email; si es SOCIO requiere vincular un padre existente. Solo accesible para Tesorero y Admin. |
| RF03  | Listar usuarios               | Muestra todos los usuarios registrados. Requiere autenticación. |
| RF04  | Ver detalle de usuario        | Muestra y permite editar o eliminar un usuario específico identificado por UUID. |
| RF05  | Ver mis hijos                 | El padre autenticado puede ver sus hijos (SOCIO) con sus inscripciones y pagos. |
| RF06  | Listar grados                 | Muestra todos los grados disponibles (1° a 7°, con división opcional A/B/C). |
| RF07  | Gestionar inscripciones       | Permite inscribir un alumno a un grado en un año, con modalidad mensual o anual. Solo Tesorero y Admin pueden crear, editar o eliminar. |
| RF08  | Listar pagos                  | Muestra todos los pagos registrados. Permite filtrar por mes y año. |
| RF09  | Registrar pago simple         | Registra el pago de un mes. Si el monto excede la cuota, el excedente se registra como donación. Si no cubre la cuota, todo se registra como donación. |
| RF10  | Registrar pago múltiple       | Registra el pago de varios meses en una sola operación. El excedente se registra como donación. |
| RF11  | Registrar pago anual          | Registra un pago anual para una inscripción de modalidad anual. |
| RF12  | Configurar cuota mensual      | Permite definir el monto de la cuota para un mes y año específico. |
| RF13  | Configurar pago anual         | Permite definir el monto del pago anual para un año específico. |

---

## 2. Restricciones

| ID   | Descripción |
|------|-------------|
| R01  | Solo usuarios con campo `activo=True` pueden autenticarse. |
| R02  | Solo Tesorero y Admin pueden crear, modificar o eliminar usuarios. |
| R03  | Solo Tesorero y Admin pueden crear, modificar o eliminar inscripciones. |
| R04  | Solo Tesorero y Admin pueden registrar, modificar o eliminar pagos. |
| R05  | Un alumno (SOCIO) solo puede tener una inscripción activa por año. |
| R06  | No se puede registrar el mismo mes dos veces para una misma inscripción. |
| R07  | No se puede registrar un pago anual en una inscripción de modalidad mensual. |
| R08  | No se puede registrar un pago mensual en una inscripción de modalidad anual. |
| R09  | El año del pago debe coincidir con el año de la inscripción. |
| R10  | Si el monto abonado no cubre la cuota, se registra íntegramente como donación. |
| R11  | Solo se puede vincular como padre a un usuario con rol PADRE. |
| R12  | Para registrar pago anual debe existir una ConfiguracionAnual activa para ese año. |

---

## 3. Requerimientos No Funcionales

| ID     | Categoría      | Nombre                   | Descripción |
|--------|----------------|--------------------------|-------------|
| RNF01  | Seguridad      | Autenticación JWT        | Todas las rutas excepto login requieren token JWT válido. |
| RNF02  | Seguridad      | Control de acceso por rol | Las acciones de escritura están restringidas por rol (TES/ADMIN). |
| RNF03  | Usabilidad     | Interfaz responsiva      | El frontend debe funcionar en dispositivos móviles y de escritorio. |
| RNF04  | Performance    | Tiempo de respuesta      | Las operaciones deben responder en menos de 3 segundos bajo carga normal. |
| RNF05  | Portabilidad   | Compatibilidad web       | Debe funcionar en Chrome, Firefox y Edge modernos. |
| RNF06  | Mantenibilidad | Arquitectura modular     | Backend y frontend separados. Backend containerizable con Docker. |
| RNF07  | Trazabilidad   | UUID en usuarios         | Los usuarios se identifican externamente por UUID para no exponer IDs internos. |
