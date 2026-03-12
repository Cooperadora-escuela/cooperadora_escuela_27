from rest_framework import generics, permissions
from .models import Usuario
from .serializers import UsuarioCreateSerializer, UsuarioSerializer

class RegistroView(generics.CreateAPIView):
    """
    Vista para registrar un nuevo usuario.
    Permite POST con los datos del usuario.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioCreateSerializer
    permission_classes = [permissions.AllowAny]  # Permitir acceso público

class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para ver, actualizar o eliminar un usuario específico por UUID.
    Requiere autenticación.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    lookup_field = 'uuid'  # Buscar por uuid en lugar de pk
    permission_classes = [permissions.IsAuthenticated]  # Solo usuarios autenticados

class UsuarioListView(generics.ListAPIView):
    """
    Vista para listar todos los usuarios.
    Requiere autenticación.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]