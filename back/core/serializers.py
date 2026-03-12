# back/core/serializers.py
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['uuid', 'email', 'dni', 'nombre', 'apellido', 
                  'rol', 'telefono', 'activo', 'fecha_registro']
        read_only_fields = ['uuid', 'fecha_registro']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = ['email', 'password', 'dni', 'nombre', 'apellido', 'rol']
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)