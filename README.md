# Plataforma de Comunicación para Cooperadora Escolar

## 📌 Objetivo del Proyecto
Desarrollar una plataforma web que facilite:
1. **Comunicación con padres**: Acceso centralizado a información escolar
2. **Gestión para cooperadora**: Herramientas administrativas para miembros

## ✨ Características Principales

### 👨‍👩‍👧‍👦 Sección Pública (Padres)
- Visualización de noticias y eventos escolares
- Calendario académico interactivo
- Documentos y recursos compartidos
- Foro de la comunidad educativa

### 👥 Área Administrativa (Cooperadora)
- **Autenticación segura** para miembros
- Panel de gestión de contenidos
- Sistema de publicación de noticias
- Gestión de eventos y calendario
- Administración de documentos

## 🛠️ Stack Tecnológico
| Componente       | Tecnología                |
|------------------|---------------------------|
| **Backend**      | Django (Python)           |
| **Frontend**     | React, Vite, Jsx          |
| **Base de datos**| Postgres                  |
| **Autenticación**| Django.contrib.auth       |
| **Despliegue**   | Git pages                 |

## 🚀 Instalación Local
```bash
# Clonar repositorio
git clone [https://github.com/Cooperadora-escuela/cooperadora_escuela_27.git]
cd cooperadora_escuela_27

# Configurar entorno virtual (Python)
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp back/mysite/mysite/.env

# Ejecutar migraciones
python manage.py makemigrations  
python manage.py migrate          

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver

