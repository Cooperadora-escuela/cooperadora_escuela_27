# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Configuración personalizada para el modelo Usuario
    """
    # Campos que se mostrarán en la lista de usuarios
    list_display = ('email', 'nombre', 'apellido', 'dni', 'rol', 'is_staff', 'is_active')
    
    # Campos por los que se puede buscar
    search_fields = ('email', 'nombre', 'apellido', 'dni')
    
    # Filtros laterales
    list_filter = ('rol', 'is_staff', 'is_active')
    
    # Campos que se mostrarán en el formulario de edición
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información personal', {'fields': ('nombre', 'apellido', 'dni', 'telefono', 'rol')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Campos que se mostrarán en el formulario de creación
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nombre', 'apellido', 'dni', 'password1', 'password2', 'rol'),
        }),
    )
    
    # Ordenamiento por defecto
    ordering = ('email',)