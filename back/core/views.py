from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario
from .permissions import EsTesoreroOAdmin
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .models import Grado, Inscripcion, Pago, CuotaMensual
from .serializers import (
    UsuarioCreateSerializer,
    UsuarioSerializer,
    UsuarioHijoSerializer,
    UsuarioLoginSerializer,
    GradoSerializer,
    InscripcionSerializer,
    PagoSerializer,
    PagoMultipleSerializer,
    PagoAnualSerializer,
    PagoSimpleSerializer,
)
from .permissions import EsTesoreroOAdmin  # asumimos que existe

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
    

class MisHijosView(generics.ListAPIView):
    """
    Retorna los alumnos (SOCIO) vinculados al padre autenticado,
    con sus inscripciones y pagos.
    """
    serializer_class = UsuarioHijoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Usuario.objects.filter(padre=self.request.user)


class GradoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer
    #permission_classes = [IsAuthenticated]

class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, EsTesoreroOAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

class PagoViewSet(viewsets.ModelViewSet):
    serializer_class = PagoSerializer

    def get_queryset(self):
        queryset = Pago.objects.all()
        mes = self.request.query_params.get('mes')
        anio = self.request.query_params.get('anio')
        if mes:
            queryset = queryset.filter(mes=mes)
        if anio:
            queryset = queryset.filter(anio=anio)
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'pago_multiple', 'pago_anual', 'pago_simple']:
            permission_classes = [IsAuthenticated, EsTesoreroOAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['post'], url_path='pago-simple')
    def pago_simple(self, request):
        serializer = PagoSimpleSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        inscripcion = serializer.context['inscripcion']
        cuota = serializer.context['cuota']
        mes = serializer.validated_data['mes']
        anio = serializer.validated_data['anio']
        monto_total = serializer.validated_data['monto_total']

        with transaction.atomic():
            if monto_total >= cuota.monto:
                Pago.objects.create(
                    inscripcion=inscripcion,
                    tipo='mensual',
                    mes=mes,
                    anio=anio,
                    monto=cuota.monto,
                    observaciones=f"Pago cuota {cuota.get_mes_display()} {anio}"
                )
                mensaje = f"Cuota de {cuota.get_mes_display()} registrada (${cuota.monto})."
                if monto_total > cuota.monto:
                    excedente = monto_total - cuota.monto
                    Pago.objects.create(
                        inscripcion=inscripcion,
                        tipo='donacion',
                        mes=None,
                        anio=anio,
                        monto=excedente,
                        observaciones=f"Excedente pago {cuota.get_mes_display()} {anio}"
                    )
                    mensaje += f" Excedente de ${excedente} registrado como donación."
            else:
                Pago.objects.create(
                    inscripcion=inscripcion,
                    tipo='donacion',
                    mes=None,
                    anio=anio,
                    monto=monto_total,
                    observaciones=f"Pago insuficiente para cuota {cuota.get_mes_display()} {anio} (cuota: ${cuota.monto})"
                )
                mensaje = f"El monto no cubre la cuota (${cuota.monto}). Se registró como donación."

        return Response({"mensaje": mensaje}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='pago-multiple')
    def pago_multiple(self, request):
        serializer = PagoMultipleSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        inscripcion = serializer.context['inscripcion']
        meses = serializer.validated_data['meses']
        anio = serializer.validated_data['anio']
        monto_total = serializer.validated_data['monto_total']
        cuotas = serializer.context['cuotas']  # ya están validadas

        monto_esperado = sum(cuota.monto for cuota in cuotas)

        with transaction.atomic():
            if monto_total >= monto_esperado:
                # Crear pagos de cuota para cada mes
                for cuota in cuotas:
                    Pago.objects.create(
                        inscripcion=inscripcion,
                        tipo='mensual',
                        mes=cuota.mes,
                        anio=anio,
                        monto=cuota.monto,
                        observaciones=f"Pago mes {cuota.get_mes_display()}"
                    )
                # Excedente
                if monto_total > monto_esperado:
                    excedente = monto_total - monto_esperado
                    Pago.objects.create(
                        inscripcion=inscripcion,
                        tipo='donacion',
                        mes=None,
                        anio=anio,
                        monto=excedente,
                        observaciones="Excedente de pago de cuotas"
                    )
                mensaje = "Pago de cuotas registrado."
                if monto_total > monto_esperado:
                    mensaje += f" Se generó una donación de ${excedente}."
            else:
                # No alcanza: todo como donación
                Pago.objects.create(
                    inscripcion=inscripcion,
                    tipo='donacion',
                    mes=None,
                    anio=anio,
                    monto=monto_total,
                    observaciones="Pago insuficiente para cuotas"
                )
                mensaje = f"El monto no cubre ninguna cuota. Se registró como donación de ${monto_total}."

        return Response({"mensaje": mensaje}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='pago-anual')
    def pago_anual(self, request):
        serializer = PagoAnualSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        inscripcion = serializer.context['inscripcion']
        anio = serializer.validated_data['anio']
        monto = serializer.validated_data['monto']

        with transaction.atomic():
            pago = Pago.objects.create(
                inscripcion=inscripcion,
                tipo='anual',
                mes=None,
                anio=anio,
                monto=monto,
                observaciones="Pago anual"
            )

        response_serializer = PagoSerializer(pago)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)