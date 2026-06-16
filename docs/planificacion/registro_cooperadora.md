# Registro de una nueva cooperadora

Guía paso a paso para que una cooperadora escolar cree su instancia en CooperaApp.

---

## Resumen del flujo

```
Cooperadora completa el formulario
        ↓
Sistema crea la cuenta en estado PENDING
        ↓
Admin de plataforma recibe email y habilita el período de prueba (TRIAL)
        ↓
Cooperadora accede con su URL y crea su primer usuario administrador
        ↓
(Al vencer el trial) Suscripción anual → estado ACTIVE
```

---

## Paso 1 — Completar el formulario de registro

Ingresar a la URL pública de registro:

```
https://cooperadoras.org/register
```

Completar los siguientes campos:

| Campo | Descripción | Ejemplo |
|---|---|---|
| Número de escuela | Número oficial de la escuela | `27` |
| Nombre de la escuela | Nombre completo | `Escuela N°27` |
| Tu nombre | Nombre del responsable de la cooperadora | `María García` |
| Email de contacto | Email donde se recibirá el acceso | `contacto@escuela27.edu.ar` |

Hacer clic en **Solicitar acceso**.

Una vez enviado, aparece el mensaje:

> _"Recibimos tu solicitud. Te contactaremos a [email] cuando tu acceso esté habilitado."_

**La cooperadora queda en estado PENDING.** No se puede ingresar todavía.

---

## Paso 2 — Habilitación por parte del administrador de plataforma

El administrador de la plataforma recibe un email automático con los datos del registro y un enlace al panel de administración.

Desde el panel en `/admin/core/cooperadora/`, el administrador puede:

- **Habilitar período de prueba** (acción: _Habilitar trial 30 días_) → estado pasa a TRIAL
- Ajustar manualmente la fecha de vencimiento del trial si se acuerda otro período

Una vez habilitado, el administrador notifica al contacto por email con:
- La URL de acceso a su instancia
- Las instrucciones para crear el primer usuario administrador

---

## Paso 3 — Primera entrada a la instancia

La URL de acceso tiene el formato:

```
https://cooperadoras.org/escuela{NÚMERO}
```

Ejemplos:
- Escuela N°27 → `https://cooperadoras.org/escuela27`
- Escuela N°4 → `https://cooperadoras.org/escuela4`
- Escuela N°130 → `https://cooperadoras.org/escuela130`

El administrador de la plataforma crea el primer usuario con rol **ADMIN** para esa cooperadora y lo comunica al contacto.

---

## Paso 4 — Crear usuarios desde el panel

Una vez dentro con el usuario ADMIN o Tesorero (TES), se pueden crear los demás usuarios desde **Nuevo usuario**:

| Rol | Para quién |
|---|---|
| ADMIN | Administrador de la cooperadora |
| Presidente (PRES) | Presidente de la comisión |
| Tesorero (TES) | Tesorero — gestiona pagos y usuarios |
| Secretario (SEC) | Secretario |
| Padre/Tutor (PAD) | Padre o tutor de un alumno |
| Alumno (SOC) | Alumno — se vincula a un padre y un grado |

---

## Estados de suscripción

| Estado | Descripción |
|---|---|
| PENDING | Solicitud recibida, pendiente de aprobación |
| TRIAL | Período de prueba activo — acceso completo |
| ACTIVE | Suscripción anual paga — acceso completo |
| EXPIRED | Trial o suscripción vencida — acceso bloqueado |
| SUSPENDED | Suspendida por el administrador de plataforma |

Cuando la suscripción vence o es bloqueada, los usuarios ven la pantalla **"Suscripción inactiva"** al intentar ingresar.

---

## Preguntas frecuentes

**¿Cuánto dura el período de prueba?**
Lo define el administrador de la plataforma al aprobar la solicitud. Generalmente 30 días.

**¿Qué pasa al vencer el trial?**
El acceso se bloquea automáticamente. Contactar al administrador de la plataforma para contratar la suscripción anual.

**¿Puedo tener más de un administrador?**
Sí. El rol ADMIN puede crear tantos usuarios con rol ADMIN como necesite.

**¿Pueden dos escuelas tener el mismo número?**
No. El número de escuela debe ser único en el sistema.

**¿El email de contacto es el email de acceso?**
No necesariamente. El email de contacto es para comunicaciones de la plataforma. El email de acceso lo define el administrador al crear el usuario.
