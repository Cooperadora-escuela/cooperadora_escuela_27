from django.db import models

# Create your models here.
from django.db import models
from django.core.validators import MinValueValidator
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator

class User(AbstractUser):
    # Configuración clave para autenticación por email
    # Agrega unique=True al campo email
    email = models.EmailField(unique=True, verbose_name='email address')
    USERNAME_FIELD = 'email'  # Usar email como identificador principal
    REQUIRED_FIELDS = ['username']  # Mantener username como campo requerido pero no para login

    
    class Meta:
        # Esta línea es crucial para evitar conflictos
        db_table = 'core_user'  # Nombre personalizado para la tabla
        # Asegurar que el email sea único
        # constraints = [
        #     models.UniqueConstraint(fields=['email'], name='unique_email')
        # ]

    # Agrega estos related_name únicos
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="core_user_groups",  # Nombre único
        related_query_name="core_user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="core_user_permissions",  # Nombre único
        related_query_name="core_user",
    )