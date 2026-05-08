import { useState } from 'react';
import { useAuth } from '../contex/UserContex';
import { API_URL } from '../config';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


const ROL_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  PRES:  'Presidente',
  TES:   'Tesorero',
  SEC:   'Secretario',
  REV:   'Revisor de Cuentas',
  DOC:   'Docente',
  MIE:   'Miembro',
  PAD:   'Padre / Tutor',
  SOC:   'Alumno',
};

export default function PerfilPage() {
  const { user, authFetch } = useAuth();

  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [apellido, setApellido] = useState(user?.apellido ?? '');
  const [telefono, setTelefono] = useState(user?.telefono ?? '');
  const [savingPerfil, setSavingPerfil] = useState(false);

  const [passActual, setPassActual] = useState('');
  const [passNuevo, setPassNuevo] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [passErrors, setPassErrors] = useState<Record<string, string>>({});

  const passChecks = [
    { label: 'Mínimo 8 caracteres',       ok: passNuevo.length >= 8 },
    { label: 'No puede ser solo números', ok: passNuevo.length > 0 && !/^\d+$/.test(passNuevo) },
    { label: 'Las contraseñas coinciden', ok: passConfirm.length > 0 && passNuevo === passConfirm },
  ];

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPerfil(true);
    try {
      const res = await authFetch(`${API_URL}/api/me/`, {
        method: 'PATCH',
        body: JSON.stringify({ nombre, apellido, telefono }),
      });
      if (res.ok) {
        toast.success('Datos actualizados correctamente.');
      } else {
        const data = await res.json();
        toast.error(Object.values(data).flat().join(' ') || 'Error al guardar.');
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrors({});
    if (passNuevo !== passConfirm) {
      setPassErrors({ password_nuevo: 'Las contraseñas no coinciden.' });
      return;
    }
    setSavingPass(true);
    try {
      const res = await authFetch(`${API_URL}/api/cambiar-password/`, {
        method: 'POST',
        body: JSON.stringify({ password_actual: passActual, password_nuevo: passNuevo }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Contraseña actualizada correctamente.');
        setPassActual('');
        setPassNuevo('');
        setPassConfirm('');
      } else {
        setPassErrors(
          typeof data === 'object'
            ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)]))
            : { password_nuevo: 'Error al cambiar la contraseña.' }
        );
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setSavingPass(false);
    }
  };

  const initials = ((user?.nombre?.[0] ?? '') + (user?.apellido?.[0] ?? '')).toUpperCase();

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
  const inputClass = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors';
  const readonlyClass = 'w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Avatar + nombre */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-cyan-500 dark:bg-cyan-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {user?.nombre} {user?.apellido}
            </p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
              {ROL_LABEL[user?.rol ?? ''] ?? user?.rol}
            </span>
          </div>
        </div>

        {/* Datos personales */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">Datos personales</h2>
          <form onSubmit={handleGuardarPerfil} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={user?.email ?? ''} disabled className={readonlyClass} />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">El email no se puede modificar.</p>
            </div>

            <div>
              <label className={labelClass}>DNI</label>
              <input type="text" value={user?.dni ?? ''} disabled className={readonlyClass} />
            </div>

            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +54 9 343 123-4567"
                className={inputClass}
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={savingPerfil}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {savingPerfil ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>

        {/* Cambiar contraseña — solo roles con login propio */}
        {user?.rol !== 'SOC' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">Cambiar contraseña</h2>
            <form onSubmit={handleCambiarPassword} className="space-y-4">

              <div>
                <label className={labelClass}>Contraseña actual</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passActual}
                    onChange={(e) => setPassActual(e.target.value)}
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {passErrors.password_actual && (
                  <p className="mt-1 text-xs text-red-500">{passErrors.password_actual}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={passNuevo}
                    onChange={(e) => setPassNuevo(e.target.value)}
                    required
                    minLength={8}
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {passNuevo.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {passChecks.map((c) => (
                      <li key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <span className={`inline-block w-3.5 h-3.5 rounded-full border text-center leading-3 text-[10px] font-bold ${c.ok ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {c.ok ? '✓' : ''}
                        </span>
                        {c.label}
                      </li>
                    ))}
                  </ul>
                )}
                {passErrors.password_nuevo && (
                  <p className="mt-1 text-xs text-red-500">{passErrors.password_nuevo}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Repetir nueva contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={passConfirm}
                  onChange={(e) => setPassConfirm(e.target.value)}
                  required
                  className={`${inputClass} ${passConfirm.length > 0 && passNuevo !== passConfirm ? 'border-red-400 dark:border-red-500' : ''}`}
                />
                {passConfirm.length > 0 && passNuevo !== passConfirm && (
                  <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden.</p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {savingPass ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
