// src/components/RegistroForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../contex/UserContex';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeaderForms from './HeaderForms';
import FooterForms from './FooterForms';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string; // nuevo campo
  nombre: string;
  apellido: string;
  dni: string;
  rol?: string;
  telefono?: string;
}

interface ApiErrors {
  email?: string[];
  password?: string[];
  nombre?: string[];
  apellido?: string[];
  dni?: string[];
  telefono?: string[];
  general?: string;
  [key: string]: string[] | string | undefined;
}

const RegistroForm: React.FC = () => {
  const { registro } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    dni: '',
    rol: 'SOC',
    telefono: '',
  });
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiErrors>({});
  const [passwordMatchError, setPasswordMatchError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores de ese campo al escribir
    if (apiErrors[name]) {
      setApiErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordMatchError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});
    setPasswordMatchError('');

    // Validar coincidencia de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError('Las contraseñas no coinciden');
      return;
    }

    // Preparar datos para enviar (sin confirmPassword)
    const { confirmPassword, ...datosEnvio } = formData;

    setLoading(true);
    try {
      const result = await registro(datosEnvio);
      if (result.success) {
        toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          nombre: '',
          apellido: '',
          dni: '',
          rol: 'SOC',
          telefono: '',
        });
        // Opcional: redirigir a login
      } else {
        // Mostrar errores por campo si vienen del backend
        if (result.error) {
          setApiErrors(result.error);
          // Si hay un error general no asociado a un campo, mostrarlo en toast
          if (result.error.general) {
            toast.error(result.error.general);
          }
        } else {
          toast.error('Error al registrar. Intenta de nuevo.');
        }
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el mensaje de error de un campo
  const getFieldError = (field: string): string | undefined => {
    const error = apiErrors[field];
    if (Array.isArray(error) && error.length > 0) {
      return error[0];
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex flex-col items-center justify-start pt-16">
      <HeaderForms subtitulo="Registro de nuevo socio" />
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        {/* <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Crear usuario, Socio por defecto</h2> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                getFieldError('nombre') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('nombre') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('nombre')}</p>
            )}
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                getFieldError('apellido') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('apellido') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('apellido')}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                getFieldError('email') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('email') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
            )}
          </div>

          {/* DNI */}
          <div>
            <label htmlFor="dni" className="block text-sm font-medium text-gray-700 mb-1">
              DNI *
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                getFieldError('dni') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('dni') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('dni')}</p>
            )}
          </div>

          {/* Teléfono (opcional) */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                getFieldError('telefono') ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('telefono') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('telefono')}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                getFieldError('password') || passwordMatchError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {getFieldError('password') && (
              <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                passwordMatchError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {passwordMatchError && (
              <p className="mt-1 text-sm text-red-600">{passwordMatchError}</p>
            )}
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
      <FooterForms/>
    </div>
  );
};

export default RegistroForm;