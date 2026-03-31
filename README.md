# Sistema de Gestión - Cooperadora Escuela 27

## Objetivo

Plataforma web para la gestión de pagos, inscripciones y socios de la Cooperadora Escolar N°27. Permite al Tesorero registrar pagos y alumnos, y a los padres consultar el historial de pagos de sus hijos.

## Funcionalidades

### Tesorero / Admin
- Registro de alumnos y vinculación con su padre/tutor
- Inscripción de alumnos a grados por año
- Registro de pagos: cuota mensual, pago anual o donación
- Pago de múltiples meses en una sola operación
- Configuración de montos de cuotas por mes y año

### Padre / Tutor
- Login con email para consultar el historial de pagos de sus hijos
- Visualización de cuotas pagas y pendientes

## Stack tecnológico

| Componente        | Tecnología                        |
|-------------------|-----------------------------------|
| **Backend**       | Django 5 + Django REST Framework  |
| **Frontend**      | React 19 + TypeScript + Vite      |
| **Base de datos** | PostgreSQL 15                     |
| **Autenticación** | JWT (djangorestframework-simplejwt)|
| **Estilos**       | Tailwind CSS + Material UI        |
| **Contenedores**  | Docker + Docker Compose           |

## Estructura del proyecto

```
cooperadora_escuela_27/
├── back/          # API Django REST
├── front/         # Frontend React + TypeScript
├── docs/
│   ├── db/        # Diagrama ERD (erd.dbml + db_diagrama.png)
│   └── flujos/    # Diagramas de flujo de negocio
└── docker-compose.yml
```

## Instalación local

### Requisitos
- Docker y Docker Compose
- Python 3.11+
- Node.js 18+

### Base de datos y pgAdmin (Docker)

```bash
docker compose up -d postgres pgadmin
```

- PostgreSQL disponible en `localhost:5432`
- pgAdmin disponible en `http://localhost:5050`
  - Email: `cooperadora@cooperadora.com`
  - Password: `cooperadora`

### Backend (Django)

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r back/requirements.txt

# Variables de entorno
cp back/.env.example back/.env  # completar con tus valores

# Migraciones
python back/manage.py migrate

# Crear superusuario
python back/manage.py createsuperuser

# Iniciar servidor
python back/manage.py runserver
```

API disponible en `http://localhost:8000/api/`

### Frontend (React)

```bash
cd front
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`

## Roles del sistema

| Rol        | Código | Descripción                              |
|------------|--------|------------------------------------------|
| Admin      | ADMIN  | Acceso total                             |
| Presidente | PRES   | Presidente de la cooperadora             |
| Tesorero   | TES    | Gestión de pagos e inscripciones         |
| Secretario | SEC    | Secretario                               |
| Revisor    | REV    | Revisor de cuentas                       |
| Docente    | DOC    | Docente                                  |
| Socio      | SOC    | Alumno inscripto                         |
| Padre      | PAD    | Padre/tutor (acceso al historial de pagos)|
| Miembro    | MIE    | Miembro de la cooperadora                |

## Documentación

- [Diagrama ERD](docs/db/erd.dbml) — editable en dbdiagram.io
- [Flujo de pagos](docs/flujos/pagos.md)
