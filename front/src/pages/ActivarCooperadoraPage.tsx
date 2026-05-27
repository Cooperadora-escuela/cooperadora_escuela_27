import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { useTenant } from '../contex/TenantContext';

interface CooperadoraInfo {
  nombre: string;
  email_contacto: string;
  slug: string;
}

export default function ActivarCooperadoraPage() {
  const [searchParams] = useSearchParams();
  const { slug } = useTenant();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [info, setInfo] = useState<CooperadoraInfo | null>(null);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', password: '', confirmar: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!token) { setTokenValido(false); return; }
    fetch(`${API_URL}/api/activar/${token}/`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: CooperadoraInfo) => { setInfo(data); setTokenValido(true); })
      .catch(() => setTokenValido(false));
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (form.password !== form.confirmar) newErrors.confirmar = 'Las contraseñas no coinciden.';
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/activar/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          dni: form.dni,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(data)) {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        }
        setErrors(mapped);
      } else {
        setExito(true);
      }
    } catch {
      setErrors({ general: 'Error de conexión. Intentá de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (tokenValido === null) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Verificando enlace...</div>;
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-3">
          <h1 className="text-2xl font-bold text-red-600">Enlace inválido</h1>
          <p className="text-gray-600">Este enlace de activación no existe o ya fue utilizado.</p>
        </div>
      </div>
    );
  }

  if (exito) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-green-700">¡Cuenta activada!</h1>
          <p className="text-gray-600">Tu usuario fue creado correctamente.</p>
          <button
            onClick={() => navigate(`/${slug}/login`)}
            className="mt-4 bg-cyan-500 text-white px-6 py-2 rounded-md hover:bg-cyan-600 transition-colors"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Activar cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">{info?.nombre}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={info?.email_contacto ?? ''}
              disabled
              className="mt-1 block w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">DNI</label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input
              type="password"
              name="confirmar"
              value={form.confirmar}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {errors.confirmar && <p className="text-red-500 text-xs mt-1">{errors.confirmar}</p>}
          </div>

          {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
          {errors.detail && <p className="text-red-500 text-sm">{errors.detail}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-cyan-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}
