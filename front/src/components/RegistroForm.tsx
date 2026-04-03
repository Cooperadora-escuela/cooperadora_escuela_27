// src/components/RegistroForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contex/UserContex';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HeaderForms from './HeaderForms';
import FooterForms from './FooterForms';

interface FormDataPAD {
  rol: 'PAD';
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  telefono: string;
}

interface FormDataSOC {
  rol: 'SOC';
  nombre: string;
  apellido: string;
  dni: string;
  email_padre: string;
  grado_id: string;
  anio: string;
  modalidad: 'mensual' | 'anual';
}

interface Grado {
  id: number;
  numero: number;
  letra: string;
}

type FormData = FormDataPAD | FormDataSOC;

interface ApiErrors {
  nombre?: string[];
  apellido?: string[];
  dni?: string[];
  email?: string[];
  password?: string[];
  email_padre?: string[];
  telefono?: string[];
  grado_id?: string[];
  anio?: string[];
  general?: string;
  [key: string]: string[] | string | undefined;
}

const emptyPAD: FormDataPAD = { rol: 'PAD', nombre: '', apellido: '', dni: '', email: '', password: '', telefono: '' };
const emptySOC: FormDataSOC = { rol: 'SOC', nombre: '', apellido: '', dni: '', email_padre: '', grado_id: '', anio: new Date().getFullYear().toString(), modalidad: 'mensual' };

const RegistroForm: React.FC = () => {
  const { registro, isTesorero, isAdmin, authFetch } = useAuth();
  const navigate = useNavigate();
  const [rol, setRol] = useState<'PAD' | 'SOC'>('PAD');
  const [formData, setFormData] = useState<FormData>(emptyPAD);
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiErrors>({});
  const [grados, setGrados] = useState<Grado[]>([]);

  // Guard: solo Tesorero o Admin
  if (!isTesorero && !isAdmin) {
    navigate('/');
    return null;
  }

  const fetchGrados = async () => {
    if (grados.length > 0) return;
    try {
      const response = await authFetch('http://127.0.0.1:8000/api/grados/');
      if (response.ok) {
        const data = await response.json();
        setGrados(data);
      }
    } catch {}
  };

  const handleRolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoRol = e.target.value as 'PAD' | 'SOC';
    setRol(nuevoRol);
    setFormData(nuevoRol === 'PAD' ? emptyPAD : emptySOC);
    setApiErrors({});
    if (nuevoRol === 'SOC') fetchGrados();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (apiErrors[name]) {
      setApiErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiErrors({});
    setLoading(true);
    try {
      let payload: any = { ...formData };
      if (rol === 'SOC') {
        payload.grado_id = parseInt(payload.grado_id);
        payload.anio = parseInt(payload.anio);
      }
      const result = await registro(payload);
      if (result.success) {
        const label = rol === 'PAD' ? 'Padre/Tutor' : 'Alumno';
        toast.success(`${label} creado correctamente.`);
        setFormData(rol === 'PAD' ? emptyPAD : emptySOC);
      } else {
        if (result.error) {
          setApiErrors(result.error);
          if (result.error.general) toast.error(result.error.general);
        } else {
          toast.error('Error al crear el usuario. Intenta de nuevo.');
        }
      }
    } catch {
      toast.error('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    const error = apiErrors[field];
    return Array.isArray(error) && error.length > 0 ? error[0] : undefined;
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
      getFieldError(field) ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-white flex flex-col items-center justify-start pt-16">
      <HeaderForms subtitulo="Crear usuario" />
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Selector de rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de usuario *</label>
            <select
              value={rol}
              onChange={handleRolChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="PAD">Padre / Tutor</option>
              <option value="SOC">Alumno (Socio)</option>
            </select>
          </div>

          {/* Campos comunes */}
          {(['nombre', 'apellido', 'dni'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field} *
              </label>
              <input
                type="text"
                name={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                required
                className={inputClass(field)}
              />
              {getFieldError(field) && <p className="mt-1 text-sm text-red-600">{getFieldError(field)}</p>}
            </div>
          ))}

          {/* Campos específicos PAD */}
          {rol === 'PAD' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={(formData as FormDataPAD).email}
                  onChange={handleChange}
                  required
                  className={inputClass('email')}
                />
                {getFieldError('email') && <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={(formData as FormDataPAD).password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className={inputClass('password')}
                />
                {getFieldError('password') && <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={(formData as FormDataPAD).telefono}
                  onChange={handleChange}
                  className={inputClass('telefono')}
                />
                {getFieldError('telefono') && <p className="mt-1 text-sm text-red-600">{getFieldError('telefono')}</p>}
              </div>
            </>
          )}

          {/* Campos específicos SOC */}
          {rol === 'SOC' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email del padre/tutor *</label>
                <input
                  type="email"
                  name="email_padre"
                  value={(formData as FormDataSOC).email_padre}
                  onChange={handleChange}
                  required
                  className={inputClass('email_padre')}
                />
                {getFieldError('email_padre') && <p className="mt-1 text-sm text-red-600">{getFieldError('email_padre')}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
                <select
                  name="grado_id"
                  value={(formData as FormDataSOC).grado_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, grado_id: e.target.value }))}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${getFieldError('grado_id') ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleccionar grado...</option>
                  {grados.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.numero}° {g.letra}
                    </option>
                  ))}
                </select>
                {getFieldError('grado_id') && <p className="mt-1 text-sm text-red-600">{getFieldError('grado_id')}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año *</label>
                  <input
                    type="number"
                    name="anio"
                    value={(formData as FormDataSOC).anio}
                    onChange={handleChange}
                    required
                    min="2020"
                    max="2099"
                    className={inputClass('anio')}
                  />
                  {getFieldError('anio') && <p className="mt-1 text-sm text-red-600">{getFieldError('anio')}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad *</label>
                  <select
                    name="modalidad"
                    value={(formData as FormDataSOC).modalidad}
                    onChange={(e) => setFormData((prev) => ({ ...prev, modalidad: e.target.value as 'mensual' | 'anual' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : `Crear ${rol === 'PAD' ? 'padre/tutor' : 'alumno'}`}
          </button>
        </form>
      </div>
      <FooterForms />
    </div>
  );
};

export default RegistroForm;
