# Escalado SaaS Multi-tenant — Planificación

> Sesión de planificación: 2026-05-26
> Estado: **Planificado, no implementado**
> Rama de desarrollo: `saas` (DB separada: `cooperadora_saas_dev`)

---

## La idea

Convertir el monolito de la Cooperadora 27 en un framework SaaS donde **cualquier cooperadora escolar** pueda tener su propia instancia de la app y su propio DAO desplegado. Cada escuela se identifica por su número (Escuela 27, Escuela 42, etc.).

El contrato ya tiene el patrón Factory en Base Sepolia — la parte Web3 está preparada para escalar. La parte Web2 necesita multi-tenancy.

---

## Research — Casos de referencia

### Patrón Web2: Frappe / ERPNext
El análogo más cercano. Un repo central, N "sites" (una por organización), cada site con su propia DB y subdominio. La capa central (`frappe/press`) maneja provisioning, SSL, billing y upgrades. Lección clave: el trabajo duro no es el aislamiento de datos sino la **capa de branding/config y el pipeline de provisioning automático**.

### Patrón Web3: Aragon v2
Factory contract despliega un DAO por organización (proxy EIP-1167). La app Web2 es un dashboard multi-tenant que lee/escribe contra la dirección del contrato que corresponde al tenant autenticado. **Exactamente el patrón que ya tenemos.** Gotcha: si escala, migrar Factory a minimal proxies (EIP-1167 clones) reduce el gas de deploy ~10x.

### Patrón multi-tenancy dominante (2024-2026)
**Pool** (row-level isolation, un `tenant_id` por tabla) es el estándar para tiers estándar. Schema-per-tenant (Bridge) para customización moderada. Instancia separada (Silo) solo para enterprise con compliance estricto.

---

## Decisiones de arquitectura

### Multi-tenancy: Pool con FK a `Cooperadora`

Una sola app Django, una sola PostgreSQL. Cada tabla de negocio tiene FK a `Cooperadora`. El middleware resuelve el tenant desde el path de la URL e inyecta el contexto en cada request.

**No se eligió:**
- Bridge (schema por tenant): solo vale si hay campos custom por escuela — no es el caso
- Silo (instancia separada): overkill para cooperadoras escolares, costo lineal de infra

### Routing: path-based (no subdominio)

```
cooperadoras.org/escuela27   → Cooperadora N°27
cooperadoras.org/escuela30   → Cooperadora N°30
cooperadoras.org/escuela4    → Cooperadora N°4
cooperadoras.org/register    → Formulario de registro público
cooperadoras.org/admin       → Panel de platform admin
```

**No se eligió subdominio** (`escuela27.cooperadoras.org`) porque requiere Vercel Pro para wildcard SSL. Path-based funciona en Vercel free tier y la migración a subdominio en el futuro es solo configuración, no arquitectura.

El `slug` se genera automáticamente: `"escuela" + numero_escuela`. No es configurable por la cooperadora.

### Dominio: `cooperadoras.org`

Comprar en NIC o Namecheap. Apuntar a Vercel (frontend) y al servidor Django (backend API).

### Onboarding: auto-registro con aprobación manual

La cooperadora completa un formulario público en `cooperadoras.org/register`. El platform admin aprueba, habilita el trial y dispara el provisioning (deploy del DAO vía Factory). La cooperadora no toca nada de infraestructura.

### Web3: backend wallet compartido

El wallet actual (`0xA6EBAb87A0a5890A5abB8D9eFC93eE534878161C`) actúa como `mintAutorizado` para todos los DAOs desplegados vía Factory. Cada cooperadora tiene su propio DAO (y por tanto su propio token COOP), pero el backend que mintea es el mismo.

---

## Modelo de datos

### Nuevo modelo: `Cooperadora` (el tenant)

```python
class SubscriptionStatus(models.TextChoices):
    PENDING   = 'PENDING',   'Pendiente'         # registrada, esperando aprobación
    TRIAL     = 'TRIAL',     'Período de prueba'  # habilitada por platform admin
    ACTIVE    = 'ACTIVE',    'Activa'             # pagó la anualidad
    EXPIRED   = 'EXPIRED',   'Vencida'            # venció sin renovar
    SUSPENDED = 'SUSPENDED', 'Suspendida'         # baja manual

class Cooperadora(models.Model):
    numero_escuela      = models.PositiveIntegerField(unique=True)
    nombre              = models.CharField(max_length=200)
    slug                = models.SlugField(unique=True)        # auto: "escuela27"
    dao_address         = models.CharField(max_length=42, blank=True)
    subscription_status = models.CharField(
                              max_length=10,
                              choices=SubscriptionStatus.choices,
                              default=SubscriptionStatus.PENDING
                          )
    trial_until         = models.DateField(null=True, blank=True)  # seteado por platform admin
    subscription_expiry = models.DateField(null=True, blank=True)  # seteado al pagar anualidad
    creada_en           = models.DateTimeField(auto_now_add=True)

    @property
    def tiene_acceso(self):
        from datetime import date
        hoy = date.today()
        if self.subscription_status == 'TRIAL':
            return self.trial_until and self.trial_until >= hoy
        if self.subscription_status == 'ACTIVE':
            return self.subscription_expiry and self.subscription_expiry >= hoy
        return False
```

### Ciclo de vida de suscripción

```
Cooperadora se registra → PENDING
        ↓  platform admin aprueba + setea trial_until
      TRIAL
        ↓  paga anualidad          ↓  trial_until vence sin pagar
      ACTIVE                     EXPIRED
        ↓  subscription_expiry vence    ↓  renueva
      EXPIRED  ←─────────────────────  ACTIVE
        ↓  baja manual
      SUSPENDED
```

- Suscripción: **anual**
- Trial: habilitado manualmente por el platform admin
- El middleware chequea `cooperadora.tiene_acceso` — si es `False` → 403

### Modelos existentes que reciben FK a `Cooperadora`

| Modelo | FK directa | Motivo |
|---|---|---|
| `Usuario` | ✅ | Punto de entrada de casi toda query |
| `Grado` | ✅ | Dos escuelas pueden tener "1°A" |
| `CuotaMensual` | ✅ | Cada escuela define sus propios montos |
| `ConfiguracionAnual` | ✅ | Idem |
| `Publicacion` | ✅ | Se consulta independiente |
| `Inscripcion` | ✅ | Facilita filtrado sin joins profundos |
| `Pago` | ✅ | Idem — reportes por cooperadora |
| `PublicacionImagen` | ❌ | Siempre accedida a través de `Publicacion` |

### Constraints que cambian

```python
# Grado
unique_together = ('cooperadora', 'numero', 'letra')   # antes: ('numero', 'letra')

# CuotaMensual
unique_together = ('cooperadora', 'anio', 'mes')       # antes: ('anio', 'mes')

# ConfiguracionAnual
unique_together = ('cooperadora', 'anio')              # antes: unique=True en anio
```

`Pago` no cambia sus constraints — siguen válidos porque `inscripcion` ya está scoped.

### DNI y email: unicidad por cooperadora

Un padre con hijos en dos escuelas distintas tiene **dos cuentas** (una por cooperadora).

```python
class Meta:
    unique_together = [
        ('cooperadora', 'dni'),
        ('cooperadora', 'email'),
    ]
```

El login necesita un auth backend custom que resuelva `email` dentro del scope del path (`cooperadoras.org/escuela27/login` → solo busca usuarios de cooperadora 27).

### Dos tipos de admin

| Tipo | Modelo | `cooperadora` FK |
|---|---|---|
| **Platform admin** (mantenimiento) | `is_superuser=True` | `null` — no pertenece a ninguna |
| **Cooperadora admin** | `rol=Rol.ADMIN` | obligatoria — scoped a su escuela |

`cooperadora` pasa a ser `null=True` en `Usuario` exclusivamente para el platform admin. Para todos los demás roles es obligatoria.

---

## Fases de desarrollo

```
Fase 1 — Migrar el monolito a multi-tenant
  ├── Crear modelo Cooperadora + migración
  ├── Seed: registrar Escuela 27 como primer tenant (slug="escuela27")
  ├── Agregar cooperadora FK a todos los modelos + migraciones
  ├── Actualizar constraints
  ├── Auth backend custom (login scoped por path)
  ├── Middleware (resuelve tenant desde primer segmento del path)
  ├── Actualizar todos los viewsets/querysets para filtrar por tenant
  └── Actualizar signals (usar cooperadora.dao_address al mintear)

Fase 2 — Panel de platform admin
  ├── Gestionar cooperadoras (ver todas, aprobar, habilitar trial, suspender)
  └── Provisioning: crear cooperadora + deploy DAO vía Factory + generar slug

Fase 3 — Registro público y onboarding
  ├── Formulario en cooperadoras.org/register
  ├── Email de confirmación al platform admin
  └── Email de bienvenida a la cooperadora cuando se aprueba

Fase 4 — Frontend multi-tenant
  ├── React Router con /escuela27/* como prefijo de rutas
  ├── Contexto de tenant (nombre + número de escuela)
  └── Pantalla de acceso bloqueado (suscripción vencida)

Fase 5 — Enforcement de suscripción
  ├── Middleware bloquea si !tiene_acceso → 403
  └── Notificaciones de vencimiento próximo (30, 15, 7 días)
```

---

## Pendiente de resolver (no bloqueante por ahora)

- [ ] **EIP-1167 minimal proxies**: evaluar migrar el Factory contract para reducir gas de deploy ~10x al escalar

## Fuera de scope por ahora

- **Modelo de cobro**: indefinido. El proyecto primero necesita validar si hay adopción real. Mientras tanto todas las cooperadoras operan en estado `TRIAL`. El modelo de datos ya soporta suscripción anual cuando llegue el momento — no requiere cambios de arquitectura.

---

## Referencias

- [Frappe/bench — multi-site management](https://github.com/frappe/bench)
- [Frappe/press — Frappe Cloud open source](https://github.com/frappe/press)
- [Aragon DAO Factory](https://legacy-docs.aragon.org/developers/tools/aragonos/smart-contract-references/factory/daofactory)
- [Multi-tenant DB patterns 2026](https://daily.dev/blog/multi-tenant-database-design-patterns-2024/)
- [GitLab Dedicated — lecciones del modelo silo](https://about.gitlab.com/blog/2023/08/03/building-gitlab-with-gitlabcom-how-gitlab-inspired-dedicated/)
