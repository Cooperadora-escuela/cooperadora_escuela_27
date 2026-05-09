import { useEffect, useState } from 'react';
import { useAuth } from '../contex/UserContex';
import { API_URL } from '../config';


interface CuotaPaga {
  mes: number;
  nombre_mes: string;
  monto: string;
  fecha_pago: string;
}

interface Donacion {
  monto: string;
  fecha_pago: string;
  observaciones: string;
}

interface InscripcionResumen {
  id: number;
  grado: string;
  anio: number;
  modalidad: string;
}

interface EstadoHijo {
  uuid: string;
  nombre: string;
  apellido: string;
  dni: string;
  inscripcion: InscripcionResumen | null;
  cuotas_pagas: CuotaPaga[];
  donaciones: Donacion[];
}

const EstadoCuentaPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [hijos, setHijos] = useState<EstadoHijo[]>([]);
  const [loading, setLoading] = useState(true);
  const [anio, setAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_URL}/api/estado-cuenta/?anio=${anio}`);
        const data = await res.json();
        setHijos(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [anio]);

  const totalPagado = (hijo: EstadoHijo) =>
    hijo.cuotas_pagas.reduce((acc, c) => acc + parseFloat(c.monto), 0).toFixed(2);

  const totalDonaciones = (hijo: EstadoHijo) =>
    hijo.donaciones.reduce((acc, d) => acc + parseFloat(d.monto), 0).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Estado de cuenta</h1>
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          >
            {[2024, 2025, 2026].map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-12">Cargando...</p>
        ) : hijos.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-12">No hay hijos registrados.</p>
        ) : (
          <div className="space-y-6">
            {hijos.map((hijo) => (
              <div key={hijo.uuid} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 dark:border-gray-700 overflow-hidden">
                {/* Encabezado hijo */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{hijo.nombre} {hijo.apellido}</p>
                    {hijo.inscripcion ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {hijo.inscripcion.grado} · {hijo.inscripcion.modalidad} · {hijo.inscripcion.anio}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Sin inscripción en {anio}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Total pagado</p>
                    <p className="text-lg font-bold text-cyan-500">${totalPagado(hijo)}</p>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {/* Cuotas pagas */}
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Cuotas pagas ({hijo.cuotas_pagas.length})
                  </h3>
                  {hijo.cuotas_pagas.length === 0 ? (
                    <p className="text-xs text-gray-400">Ninguna</p>
                  ) : (
                    <ul className="space-y-1">
                      {hijo.cuotas_pagas.map((c) => (
                        <li key={c.mes} className="flex justify-between text-xs">
                          <span className="text-gray-700 dark:text-gray-300">{c.nombre_mes}</span>
                          <span className="text-green-600 font-medium">${c.monto}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Donaciones */}
                {hijo.donaciones.length > 0 && (
                  <div className="px-6 pb-4 border-t border-gray-50 pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Donaciones · Total: ${totalDonaciones(hijo)}
                    </h3>
                    <ul className="space-y-1">
                      {hijo.donaciones.map((d, i) => (
                        <li key={i} className="flex justify-between text-xs">
                          <span className="text-gray-500">
                            {new Date(d.fecha_pago).toLocaleDateString('es-AR')}
                            {d.observaciones ? ` · ${d.observaciones}` : ''}
                          </span>
                          <span className="text-cyan-500 font-medium">${d.monto}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EstadoCuentaPage;
