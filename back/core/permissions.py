# core/permissions.py
from rest_framework import permissions

class EsTesoreroOAdmin(permissions.BasePermission):
    """
    Permiso que solo concede acceso a usuarios con rol 'TES' (Tesorero) o 'ADMIN' (Administrador).
    Asume que el modelo Usuario tiene un campo 'rol' con esos valores.
    """
    def has_permission(self, request, view):
        # Verificar que el usuario esté autenticado
        if not request.user.is_authenticated:
            return False
        # Verificar el rol
        return request.user.rol in ['TES', 'ADMIN']