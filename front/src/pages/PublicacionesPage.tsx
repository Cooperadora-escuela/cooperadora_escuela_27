import { useEffect, useState } from 'react';
import { useAuth } from '../contex/UserContex';
import { API_URL } from '../config';


interface Publicacion {
  id: number;
  titulo: string;
  contenido: string;
  tipo: 'noticia' | 'agenda' | 'novedad';
  fecha: string;
  autor_nombre: string | null;
}

const TIPO_LABELS: Record<string, string> = {
  noticia: 'Noticia',
  agenda: 'Agenda',
  novedad: 'Novedad',
};

const TIPO_COLORS: Record<string, string> = {
  noticia: 'bg-blue-100 text-blue-700',
  agenda: 'bg-green-100 text-green-700',
  novedad: 'bg-yellow-100 text-yellow-700',
};

type FormState = { titulo: string; contenido: string; tipo: 'noticia' | 'agenda' | 'novedad' };
const EMPTY_FORM: FormState = { titulo: '', contenido: '', tipo: 'noticia' };

const PublicacionesPage: React.FC = () => {
  const { authFetch, isAdmin, isSecretario } = useAuth();
  const canManage = isAdmin || isSecretario;

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Publicacion | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [detalle, setDetalle] = useState<Publicacion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const res = await authFetch('${API_URL}/api/publicaciones/');
      const data = await res.json();
      setPublicaciones(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPublicaciones(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  };

  const abrirEditar = (pub: Publicacion) => {
    setEditando(pub);
    setForm({ titulo: pub.titulo, contenido: pub.contenido, tipo: pub.tipo });
    setError(null);
    setShowForm(true);
  };

  const guardar = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError('Título y contenido son obligatorios.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const url = editando
        ? `${API_URL}/api/publicaciones/${editando.id}/`
        : '${API_URL}/api/publicaciones/';
      const method = editando ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) {
        const data = await res.json();
        setError(JSON.stringify(data));
        return;
      }
      setShowForm(false);
      fetchPublicaciones();
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta publicación?')) return;
    await authFetch(`${API_URL}/api/publicaciones/${id}/`, { method: 'DELETE' });
    setDetalle(null);
    fetchPublicaciones();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Publicaciones</h1>
          {canManage && (
            <button
              onClick={abrirCrear}
              className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Nueva publicación
            </button>
          )}
        </div>

        {/* Modal form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {editando ? 'Editar publicación' : 'Nueva publicación'}
              </h2>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Título"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value as typeof form.tipo })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="noticia">Noticia</option>
                  <option value="agenda">Agenda</option>
                  <option value="novedad">Novedad</option>
                </select>
                <textarea
                  placeholder="Contenido"
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  rows={5}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardar}
                  disabled={guardando}
                  className="px-4 py-2 text-sm rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors disabled:opacity-60"
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal detalle */}
        {detalle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${TIPO_COLORS[detalle.tipo]}`}>
                  {TIPO_LABELS[detalle.tipo]}
                </span>
                <button onClick={() => setDetalle(null)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{detalle.titulo}</h2>
              <p className="text-xs text-gray-400 mb-4">
                {detalle.autor_nombre} · {new Date(detalle.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{detalle.contenido}</p>
              {canManage && (
                <div className="flex gap-2 mt-6 justify-end">
                  <button
                    onClick={() => { setDetalle(null); abrirEditar(detalle); }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-cyan-300 text-cyan-600 hover:bg-cyan-50 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminar(detalle.id)}
                    className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-12">Cargando...</p>
        ) : publicaciones.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-12">No hay publicaciones aún.</p>
        ) : (
          <div className="space-y-3">
            {publicaciones.map((pub) => (
              <button
                key={pub.id}
                onClick={() => setDetalle(pub)}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 px-5 py-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIPO_COLORS[pub.tipo]}`}>
                    {TIPO_LABELS[pub.tipo]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(pub.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{pub.titulo}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{pub.contenido}</p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicacionesPage;
