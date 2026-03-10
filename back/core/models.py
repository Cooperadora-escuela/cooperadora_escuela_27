# back/usuarios/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
import uuid

class Rol(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    PRESIDENTE = 'PRES', 'Presidente'
    TESORERO = 'TES', 'Tesorero'
    SECRETARIO = 'SEC', 'Secretario'
    REVISOR = 'REV', 'Revisor de Cuentas'
    DOCENTE = 'DOC', 'Docente'
    SOCIO = 'SOC', 'Socio'
    PADRE = 'PAD', 'Padre'
    MIEMBRO = 'MIE', 'Miembro Cooperadora'

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)
        extra_fields.setdefault('activo', True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('activo', True)
        extra_fields.setdefault('rol', Rol.ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
            
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractUser):
    """
    Extiende el User model de Django
    """
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    dni = models.CharField(max_length=20, unique=True)
    rol = models.CharField(
        max_length=5,
        choices=Rol.choices,
        default=Rol.SOCIO
    )
    telefono = models.CharField(max_length=20, blank=True)
    activo = models.BooleanField(default=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    # Deshabilitamos campos que no usamos
    first_name = None
    last_name = None
    username = None
    
    # Campos personalizados
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    
    # Configuración
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['dni', 'nombre', 'apellido']
    
    # Manager personalizado
    objects = UsuarioManager()
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.dni}"
    
    def save(self, *args, **kwargs):
        # Aseguramos que is_active sincronice con activo
        self.is_active = self.activo
        super().save(*args, **kwargs)