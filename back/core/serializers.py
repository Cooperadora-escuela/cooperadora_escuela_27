# back/core/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from .models import Grado, Inscripcion, Pago, CuotaMensual, ConfiguracionAnual, Usuario

from django.contrib.auth import authenticate

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['uuid', 'email', 'dni', 'nombre', 'apellido',
                  'rol', 'telefono', 'activo', 'fecha_registro']
        read_only_fields = ['uuid', 'fecha_registro']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    padre_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(rol='PAD'),
        source='padre',
        required=False,
        allow_null=True
    )

    class Meta:
        model = Usuario
        fields = ['email', 'password', 'dni', 'nombre', 'apellido', 'rol', 'telefono', 'padre_id']

    def validate(self, data):
        rol = data.get('rol', 'SOC')
        email = data.get('email')
        padre = data.get('padre')

        if rol == 'PAD' and not email:
            raise serializers.ValidationError({'email': 'El email es obligatorio para usuarios con rol Padre.'})
        if rol == 'SOC' and not padre:
            raise serializers.ValidationError({'padre_id': 'El alumno debe tener un padre/tutor asignado.'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user
    
class UsuarioLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Autenticar usando el email (asumiendo que es el campo de identificación)
            user = authenticate(request=self.context.get('request'),
                                username=email, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas.')
        else:
            raise serializers.ValidationError('Debe proporcionar email y contraseña.')

        data['user'] = user
        return data



class GradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__'

class UsuarioHijoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['uuid', 'nombre', 'apellido', 'dni', 'rol']

class InscripcionSerializer(serializers.ModelSerializer):
    usuario = UsuarioHijoSerializer(read_only=True)
    usuario_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        source='usuario',
        write_only=True
    )
    grado = serializers.PrimaryKeyRelatedField(queryset=Grado.objects.all())

    class Meta:
        model = Inscripcion
        fields = '__all__'
        read_only_fields = ['fecha_inscripcion']

    def validate(self, data):
        # Validar que el usuario sea socio (opcional, según tu lógica)
        usuario = data['usuario']
        if usuario.rol not in ['SOC', 'SOCIO']:  # ajusta según tu choice
            raise serializers.ValidationError("El usuario debe tener rol de socio.")
        # Validar que no exista otra inscripción para el mismo año
        if Inscripcion.objects.filter(usuario=usuario, anio=data['anio']).exists():
            raise serializers.ValidationError("El usuario ya tiene una inscripción para este año.")
        return data

class PagoSerializer(serializers.ModelSerializer):
    inscripcion_detalle = InscripcionSerializer(source='inscripcion', read_only=True)
    inscripcion_id = serializers.PrimaryKeyRelatedField(
        queryset=Inscripcion.objects.all(),
        source='inscripcion',
        write_only=True
    )

    class Meta:
        model = Pago
        fields = '__all__'
        read_only_fields = ['fecha_pago']

    def validate(self, data):
        # Validar que si es mensual, tenga mes; si no, que mes sea null
        if data['tipo'] == 'mensual' and data.get('mes') is None:
            raise serializers.ValidationError("El mes es obligatorio para pagos mensuales.")
        if data['tipo'] != 'mensual' and data.get('mes') is not None:
            raise serializers.ValidationError("El mes solo debe indicarse para pagos mensuales.")
        # Validar que el año coincida con la inscripción
        if data['inscripcion'].anio != data['anio']:
            raise serializers.ValidationError("El año del pago debe coincidir con el año de la inscripción.")
        # Si es anual, verificar modalidad y que no exista ya un pago anual
        if data['tipo'] == 'anual':
            if data['inscripcion'].modalidad != 'anual':
                raise serializers.ValidationError("No se puede registrar pago anual para una inscripción mensual.")
            if Pago.objects.filter(inscripcion=data['inscripcion'], tipo='anual').exists():
                raise serializers.ValidationError("Ya existe un pago anual para esta inscripción.")
        return data

# Serializer para pago simple (un mes) con lógica cuota + donación
class PagoSimpleSerializer(serializers.Serializer):
    inscripcion_id = serializers.IntegerField()
    mes = serializers.IntegerField(min_value=1, max_value=12)
    anio = serializers.IntegerField()
    monto_total = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, data):
        try:
            inscripcion = Inscripcion.objects.get(id=data['inscripcion_id'], anio=data['anio'])
        except Inscripcion.DoesNotExist:
            raise serializers.ValidationError("Inscripción no encontrada para ese año.")

        if inscripcion.modalidad != 'mensual':
            raise serializers.ValidationError("La inscripción no es de modalidad mensual.")

        if Pago.objects.filter(inscripcion=inscripcion, tipo='mensual', mes=data['mes'], anio=data['anio']).exists():
            raise serializers.ValidationError("Ya existe un pago registrado para ese mes.")

        try:
            cuota = CuotaMensual.objects.get(anio=data['anio'], mes=data['mes'], activa=True)
        except CuotaMensual.DoesNotExist:
            raise serializers.ValidationError(f"No hay cuota definida para ese mes y año.")

        self.context['inscripcion'] = inscripcion
        self.context['cuota'] = cuota
        return data


# Serializer para el pago múltiple (varios meses)
class PagoMultipleSerializer(serializers.Serializer):
    inscripcion_id = serializers.IntegerField()
    meses = serializers.ListField(child=serializers.IntegerField(min_value=1, max_value=12))
    anio = serializers.IntegerField()
    monto_total = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_inscripcion_id(self, value):
        try:
            inscripcion = Inscripcion.objects.get(id=value)
        except Inscripcion.DoesNotExist:
            raise serializers.ValidationError("Inscripción no encontrada.")
        # Guardamos la inscripción en el contexto para usarla después
        self.context['inscripcion'] = inscripcion
        return value

    def validate(self, data):
        inscripcion = self.context.get('inscripcion')
        if not inscripcion:
            # Si no vino del validate_inscripcion_id, lo buscamos
            try:
                inscripcion = Inscripcion.objects.get(id=data['inscripcion_id'])
            except Inscripcion.DoesNotExist:
                raise serializers.ValidationError("Inscripción no encontrada.")

        # Validar que la inscripción sea del año indicado
        if inscripcion.anio != data['anio']:
            raise serializers.ValidationError("El año del pago debe coincidir con el año de la inscripción.")

        # Validar que la modalidad sea mensual
        if inscripcion.modalidad != 'mensual':
            raise serializers.ValidationError("La inscripción no es de modalidad mensual, no se pueden pagar meses sueltos.")

        # Validar que los meses tengan cuota definida
        cuotas = CuotaMensual.objects.filter(anio=data['anio'], mes__in=data['meses'], activa=True)
        if cuotas.count() != len(data['meses']):
            meses_faltantes = set(data['meses']) - set(cuotas.values_list('mes', flat=True))
            raise serializers.ValidationError(f"No hay cuota definida para los meses: {meses_faltantes}")

        # Guardar las cuotas en el contexto para no volver a consultar
        self.context['cuotas'] = cuotas
        self.context['inscripcion'] = inscripcion
        return data

# Serializer para pago anual (simple, con validación)
class PagoAnualSerializer(serializers.Serializer):
    inscripcion_id = serializers.IntegerField()
    anio = serializers.IntegerField()
    monto = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate(self, data):
        try:
            inscripcion = Inscripcion.objects.get(id=data['inscripcion_id'], anio=data['anio'])
        except Inscripcion.DoesNotExist:
            raise serializers.ValidationError("Inscripción no encontrada para ese año.")

        if inscripcion.modalidad != 'anual':
            raise serializers.ValidationError("La inscripción no es de modalidad anual.")

        if Pago.objects.filter(inscripcion=inscripcion, tipo='anual').exists():
            raise serializers.ValidationError("Ya existe un pago anual para esta inscripción.")

        # Si no se envía monto, se busca en ConfiguracionAnual
        if 'monto' not in data or data['monto'] is None:
            try:
                config = ConfiguracionAnual.objects.get(anio=data['anio'], activa=True)
                data['monto'] = config.monto
            except ConfiguracionAnual.DoesNotExist:
                raise serializers.ValidationError("No hay configuración de pago anual para este año. Debe enviar el monto.")
        self.context['inscripcion'] = inscripcion
        return data