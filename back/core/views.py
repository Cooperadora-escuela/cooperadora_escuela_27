from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
#from django.contrib.auth import login
from .models import Usuario
from .serializers import UsuarioCreateSerializer, UsuarioSerializer, UsuarioLoginSerializer

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
    #permission_classes = [permissions.IsAuthenticated]  # Solo usuarios autenticados

class UsuarioListView(generics.ListAPIView):
    """
    Vista para listar todos los usuarios.
    Requiere autenticación.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    #permission_classes = [permissions.IsAuthenticated]

class UsuarioLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UsuarioLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        # Opcional: incluir datos del usuario
        user_data = UsuarioSerializer(user).data
        return Response({**tokens, 'user': user_data}, status=status.HTTP_200_OK)