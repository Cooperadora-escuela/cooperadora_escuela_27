import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contex/UserContex';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


interface Cuota {
  id: number;
  anio: number;
  mes: number;
  nombre_mes: string;
  monto: string;
  activa: boolean;
}

const MESES_CICLO = [
  { num: 3, nombre: 'Marzo' },
  { num: 4, nombre: 'Abril' },
  { num: 5, nombre: 'Mayo' },
  { num: 6, nombre: 'Junio' },
  { num: 7, nombre: 'Julio' },
  { num: 8, nombre: 'Agosto' },
  { num: 9, nombre: 'Septiembre' },
  { num: 10, nombre: 'Octubre' },
  { num: 11, nombre: 'Noviembre' },
  { num: 12, nombre: 'Diciembre' },
];

type FilaCuota = {
  id: number | null;
  monto: string;
  activa: boolean;
  guardando: boolean;
  dirty: boolean;
};

export default function CuotasPage() {
  const { authFetch, isAdmin, isTesorero, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [filas, setFilas] = useState<Record<number, FilaCuota>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin && !isTesorero) navigate('/');
  }, [authLoading, isAdmin, isTesorero, navigate]);

  const inicializarFilas = useCallback((cuotas: Cuota[]) => {
    const mapa: Record<number, FilaCuota> = {};
    MESES_CICLO.forEach(({ num }) => {
      const existente = cuotas.find((c) => c.mes === num);
      mapa[num] = {
        id: existente?.id ?? null,
        monto: existente?.monto ?? '',
        activa: existente?.activa ?? true,
        guardando: false,
        dirty: false,
      };
    });
    setFilas(mapa);
  }, []);

  useEffect(() => {
    setLoading(true);
    authFetch(`${API_URL}/api/cuotas/?anio=${anio}`)
      .then((r) => r.json())
      .then((data: Cuota[]) => inicializarFilas(data))
      .catch(() => toast.error('Error al cargar cuotas.'))
      .finally(() => setLoading(false));
  }, [anio, inicializarFilas]);

  const setFila = (mes: number, patch: Partial<FilaCuota>) =>
    setFilas((prev) => ({ ...prev, [mes]: { ...prev[mes], ...patch } }));

  const handleGuardar = async (mes: number) => {
    const fila = filas[mes];
    if (!fila.monto || isNaN(parseFloat(fila.monto))) {
      toast.error('Ingresá un monto válido.');
      return;
    }
    setFila(mes, { guardando: true });
    try {
      const body = { anio, mes, monto: parseFloat(fila.monto), activa: fila.activa };
      const res = fila.id
        ? await authFetch(`${API_URL}/api/cuotas/${fila.id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ monto: body.monto, activa: body.activa }),
          })
        : await authFetch('${API_URL}/api/cuotas/', {
            method: 'POST',
            body: JSON.stringify(body),
          });

      if (res.ok) {
        const data: Cuota = await res.json();
        setFila(mes, { id: data.id, monto: data.monto, activa: data.activa, dirty: false });
        toast.success(`Cuota de ${MESES_CICLO.find((m) => m.num === mes)?.nombre} guardada.`);
      } else {
        const err = await res.json();
        const msg = Object.values(err).flat().join(' ') || 'Error al guardar.';
        toast.error(msg);
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setFila(mes, { guardando: false });
    }
  };

  const handleToggleActiva = async (mes: number) => {
    const fila = filas[mes];
    if (!fila.id) {
      setFila(mes, { activa: !fila.activa, dirty: true });
      return;
    }
    setFila(mes, { guardando: true });
    try {
      const res = await authFetch(`${API_URL}/api/cuotas/${fila.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ activa: !fila.activa }),
      });
      if (res.ok) {
        const data: Cuota = await res.json();
        setFila(mes, { activa: data.activa });
        toast.success(`Cuota ${data.activa ? 'habilitada' : 'deshabilitada'}.`);
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setFila(mes, { guardando: false });
    }
  };

  const configuradas = Object.values(filas).filter((f) => f.id !== null).length;
  const habilitadas = Object.values(filas).filter((f) => f.id !== null && f.activa).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Encabezado */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cuotas mensuales</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configurá el monto de cada mes del ciclo lectivo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
              min="2020"
              max="2099"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Meses del ciclo</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{MESES_CICLO.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Configuradas</p>
            <p className="text-2xl font-bold text-cyan-600">{configuradas}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Habilitadas</p>
            <p className="text-2xl font-bold text-green-600">{habilitadas}</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-gray-400">Cargando...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Mes</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Monto ($)</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Habilitada</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {MESES_CICLO.map(({ num, nombre }) => {
                  const fila = filas[num];
                  if (!fila) return null;
                  const esNueva = fila.id === null;
                  return (
                    <tr key={num} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-gray-100">{nombre}</td>

                      <td className="px-5 py-3">
                        <div className="relative w-36">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={fila.monto}
                            onChange={(e) => setFila(num, { monto: e.target.value, dirty: true })}
                            placeholder="0.00"
                            className="w-full pl-7 pr-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                          />
                        </div>
                      </td>

                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleToggleActiva(num)}
                          disabled={fila.guardando}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                            fila.activa ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          aria-label={fila.activa ? 'Deshabilitar' : 'Habilitar'}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${fila.activa ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>

                      <td className="px-5 py-3 text-center">
                        {esNueva ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            Sin configurar
                          </span>
                        ) : fila.activa ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            Activa
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            Inactiva
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleGuardar(num)}
                          disabled={fila.guardando || (!fila.dirty && !esNueva)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                        >
                          {fila.guardando ? 'Guardando...' : esNueva ? 'Crear' : 'Guardar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
