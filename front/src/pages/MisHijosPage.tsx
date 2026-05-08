import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contex/UserContex';
import { API_URL } from '../config';


interface Inscripcion {
  id: number;
  grado: string;
  anio: number;
  modalidad: string;
  activa: boolean;
  fecha_inscripcion: string;
}

interface Hijo {
  uuid: string;
  nombre: string;
  apellido: string;
  dni: string;
  rol: string;
  inscripciones: Inscripcion[];
}

const MisHijosPage: React.FC = () => {
  const { authFetch } = useAuth();
  const [hijos, setHijos] = useState<Hijo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await authFetch('${API_URL}/api/mis-hijos/');
        const data = await res.json();
        setHijos(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const inscripcionActiva = (hijo: Hijo) =>
    hijo.inscripciones.find((i) => i.activa) ?? hijo.inscripciones[0] ?? null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Mis hijos</h1>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-12">Cargando...</p>
        ) : hijos.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-12">No tenés hijos registrados.</p>
        ) : (
          <div className="space-y-4">
            {hijos.map((hijo) => {
              const ins = inscripcionActiva(hijo);
              return (
                <div
                  key={hijo.uuid}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-lg shrink-0">
                      {hijo.nombre.charAt(0)}{hijo.apellido.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {hijo.nombre} {hijo.apellido}
                      </p>
                      <p className="text-xs text-gray-400">DNI {hijo.dni}</p>
                      {ins ? (
                        <p className="text-sm text-gray-600 mt-0.5">
                          {ins.grado} · {ins.modalidad} · {ins.anio}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Sin inscripción activa</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <Link
                      to="/estado-cuenta"
                      className="text-sm font-medium text-cyan-500 hover:text-cyan-700 transition-colors"
                    >
                      Ver estado de cuenta →
                    </Link>
                    {hijo.inscripciones.length > 1 && (
                      <details className="text-xs text-gray-400 cursor-pointer">
                        <summary>Historial ({hijo.inscripciones.length} inscripciones)</summary>
                        <ul className="mt-1 space-y-0.5 pl-2">
                          {hijo.inscripciones.map((i) => (
                            <li key={i.id}>
                              {i.grado} · {i.anio} · {i.modalidad}
                              {i.activa && <span className="ml-1 text-cyan-500">(activa)</span>}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MisHijosPage;
