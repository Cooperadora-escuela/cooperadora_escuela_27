# core/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Grado, Inscripcion, CuotaMensual, ConfiguracionAnual, Pago

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

@admin.register(Grado)
class GradoAdmin(admin.ModelAdmin):
    list_display = ('numero', 'letra')
    ordering = ('numero', 'letra')

@admin.register(Inscripcion)
class InscripcionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'grado', 'anio', 'modalidad', 'activa')
    list_filter = ('anio', 'modalidad', 'activa')
    search_fields = ('usuario__nombre', 'usuario__apellido', 'usuario__dni')

@admin.register(CuotaMensual)
class CuotaMensualAdmin(admin.ModelAdmin):
    list_display = ('anio', 'mes', 'monto', 'activa')
    list_filter = ('anio', 'activa')
    ordering = ('-anio', 'mes')

@admin.register(ConfiguracionAnual)
class ConfiguracionAnualAdmin(admin.ModelAdmin):
    list_display = ('anio', 'monto', 'activa')

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('inscripcion', 'tipo', 'mes', 'anio', 'monto', 'fecha_pago')
    list_filter = ('tipo', 'anio')
    search_fields = ('inscripcion__usuario__nombre', 'inscripcion__usuario__apellido')
    date_hierarchy = 'fecha_pago'