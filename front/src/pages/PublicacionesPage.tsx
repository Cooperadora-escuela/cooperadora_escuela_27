import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contex/UserContex';
import { API_URL } from '../config';

interface PublicacionImagen {
  id: number;
  imagen: string;
  orden: number;
}

interface Publicacion {
  id: number;
  titulo: string;
  encabezado: string | null;
  contenido: string;
  tipo: 'noticia' | 'agenda' | 'novedad';
  imagen_portada: string | null;
  fecha: string;
  autor_nombre: string | null;
  imagenes: PublicacionImagen[];
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

type FormState = {
  titulo: string;
  encabezado: string;
  contenido: string;
  tipo: 'noticia' | 'agenda' | 'novedad';
  imagen_portada: File | null;
  imagenes_nuevas: File[];
  eliminar_imagenes: number[];
};

const EMPTY_FORM: FormState = {
  titulo: '',
  encabezado: '',
  contenido: '',
  tipo: 'noticia',
  imagen_portada: null,
  imagenes_nuevas: [],
  eliminar_imagenes: [],
};

const PublicacionesPage: React.FC = () => {
  const { authFetch, isAdmin, isSecretario } = useAuth();
  const canManage = isAdmin || isSecretario;

  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Publicacion | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Publicacion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);
  const galeriaInputRef = useRef<HTMLInputElement>(null);

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/publicaciones/`);
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
    setPortadaPreview(null);
    setError(null);
    setShowForm(true);
  };

  const abrirEditar = (pub: Publicacion) => {
    setEditando(pub);
    setForm({
      titulo: pub.titulo,
      encabezado: pub.encabezado ?? '',
      contenido: pub.contenido,
      tipo: pub.tipo,
      imagen_portada: null,
      imagenes_nuevas: [],
      eliminar_imagenes: [],
    });
    setPortadaPreview(pub.imagen_portada ?? null);
    setError(null);
    setShowForm(true);
  };

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setForm(f => ({ ...f, imagen_portada: file }));
    setPortadaPreview(file ? URL.createObjectURL(file) : (editando?.imagen_portada ?? null));
  };

  const handleGaleriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setForm(f => ({ ...f, imagenes_nuevas: [...f.imagenes_nuevas, ...files] }));
  };

  const quitarNueva = (idx: number) => {
    setForm(f => ({ ...f, imagenes_nuevas: f.imagenes_nuevas.filter((_, i) => i !== idx) }));
  };

  const toggleEliminarExistente = (id: number) => {
    setForm(f => ({
      ...f,
      eliminar_imagenes: f.eliminar_imagenes.includes(id)
        ? f.eliminar_imagenes.filter(x => x !== id)
        : [...f.eliminar_imagenes, id],
    }));
  };

  const guardar = async () => {
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError('Título y contenido son obligatorios.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('titulo', form.titulo);
      fd.append('encabezado', form.encabezado);
      fd.append('contenido', form.contenido);
      fd.append('tipo', form.tipo);
      if (form.imagen_portada) fd.append('imagen_portada', form.imagen_portada);
      form.imagenes_nuevas.forEach(img => fd.append('imagenes', img));
      form.eliminar_imagenes.forEach(id => fd.append('eliminar_imagenes', String(id)));

      const url = editando
        ? `${API_URL}/api/publicaciones/${editando.id}/`
        : `${API_URL}/api/publicaciones/`;
      const method = editando ? 'PUT' : 'POST';
      const res = await authFetch(url, { method, body: fd });
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {editando ? 'Editar publicación' : 'Nueva publicación'}
              </h2>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <div className="space-y-3">

                <input
                  type="text"
                  placeholder="Título *"
                  value={form.titulo}
                  onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-gray-700 dark:text-gray-100"
                />

                <input
                  type="text"
                  placeholder="Encabezado (opcional)"
                  value={form.encabezado}
                  onChange={(e) => setForm(f => ({ ...f, encabezado: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-gray-700 dark:text-gray-100"
                />

                <select
                  value={form.tipo}
                  onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value as FormState['tipo'] }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="noticia">Noticia</option>
                  <option value="agenda">Agenda</option>
                  <option value="novedad">Novedad</option>
                </select>

                <textarea
                  placeholder="Contenido *"
                  value={form.contenido}
                  onChange={(e) => setForm(f => ({ ...f, contenido: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none dark:bg-gray-700 dark:text-gray-100"
                />

                {/* Imagen de portada */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen de portada</p>
                  {portadaPreview && (
                    <div className="relative mb-2 inline-block">
                      <img src={portadaPreview} alt="portada" className="h-28 w-auto rounded-lg object-cover border border-gray-200 dark:border-gray-600" />
                      <button
                        type="button"
                        onClick={() => { setPortadaPreview(null); setForm(f => ({ ...f, imagen_portada: null })); if (portadaInputRef.current) portadaInputRef.current.value = ''; }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                      >×</button>
                    </div>
                  )}
                  <input
                    ref={portadaInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePortadaChange}
                    className="block text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                  />
                </div>

                {/* Galería */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Galería de imágenes</p>

                  {/* Imágenes existentes (solo en edición) */}
                  {editando && editando.imagenes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editando.imagenes.map(img => (
                        <div key={img.id} className="relative">
                          <img
                            src={img.imagen}
                            alt=""
                            className={`h-16 w-16 object-cover rounded-lg border-2 transition-opacity ${form.eliminar_imagenes.includes(img.id) ? 'opacity-30 border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                          />
                          <button
                            type="button"
                            onClick={() => toggleEliminarExistente(img.id)}
                            className={`absolute -top-1.5 -right-1.5 rounded-full w-5 h-5 text-xs flex items-center justify-center text-white ${form.eliminar_imagenes.includes(img.id) ? 'bg-gray-400' : 'bg-red-500'}`}
                          >
                            {form.eliminar_imagenes.includes(img.id) ? '↩' : '×'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Nuevas imágenes preview */}
                  {form.imagenes_nuevas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.imagenes_nuevas.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="h-16 w-16 object-cover rounded-lg border-2 border-cyan-300"
                          />
                          <button
                            type="button"
                            onClick={() => quitarNueva(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    ref={galeriaInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGaleriaChange}
                    className="block text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                  />
                </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${TIPO_COLORS[detalle.tipo]}`}>
                  {TIPO_LABELS[detalle.tipo]}
                </span>
                <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
              </div>

              {detalle.imagen_portada && (
                <img
                  src={detalle.imagen_portada}
                  alt={detalle.titulo}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">{detalle.titulo}</h2>

              {detalle.encabezado && (
                <p className="text-base text-gray-600 dark:text-gray-300 font-medium mb-2">{detalle.encabezado}</p>
              )}

              <p className="text-xs text-gray-400 mb-4">
                {detalle.autor_nombre} · {new Date(detalle.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>

              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{detalle.contenido}</p>

              {detalle.imagenes.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {detalle.imagenes.map(img => (
                    <img
                      key={img.id}
                      src={img.imagen}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(img.imagen, '_blank')}
                    />
                  ))}
                </div>
              )}

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
          <p className="text-center text-gray-500 dark:text-gray-400 mt-12">Cargando...</p>
        ) : publicaciones.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500 mt-12">No hay publicaciones aún.</p>
        ) : (
          <div className="space-y-3">
            {publicaciones.map((pub) => (
              <button
                key={pub.id}
                onClick={() => setDetalle(pub)}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  {pub.imagen_portada && (
                    <img
                      src={pub.imagen_portada}
                      alt={pub.titulo}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TIPO_COLORS[pub.tipo]}`}>
                        {TIPO_LABELS[pub.tipo]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(pub.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{pub.titulo}</p>
                    {pub.encabezado && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pub.encabezado}</p>
                    )}
                    {!pub.encabezado && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{pub.contenido}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicacionesPage;
