import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contex/UserContex';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Inscripcion {
  id: number;
  usuario: {
    nombre: string;
    apellido: string;
    dni: string;
  };
  grado: number;
  anio: number;
}

interface Pago {
  id: number;
  inscripcion_detalle: Inscripcion;
  tipo: 'mensual' | 'anual' | 'donacion';
  mes: number | null;
  anio: number;
  monto: string;
  fecha_pago: string;
  observaciones: string;
}

const MESES: Record<number, string> = {
  3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
  7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre',
  11: 'Noviembre', 12: 'Diciembre',
};

const TIPO_LABEL: Record<string, string> = {
  mensual: 'Cuota mensual',
  anual: 'Pago anual',
  donacion: 'Donación',
};

const TIPO_COLOR: Record<string, string> = {
  mensual: 'bg-blue-100 text-blue-800',
  anual: 'bg-green-100 text-green-800',
  donacion: 'bg-purple-100 text-purple-800',
};

interface FormPago {
  inscripcion_id: string;
  mes: string;
  anio: string;
  monto_total: string;
}

export default function PagosPage() {
  const { authFetch, isAdmin, isTesorero, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear().toString());

  const [modalOpen, setModalOpen] = useState(false);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [formPago, setFormPago] = useState<FormPago>({
    inscripcion_id: '', mes: '', anio: new Date().getFullYear().toString(), monto_total: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin && !isTesorero) {
      navigate('/');
    }
  }, [authLoading, isAdmin, isTesorero, navigate]);

  useEffect(() => {
    fetchPagos();
  }, [filtroMes, filtroAnio]);

  const fetchInscripciones = async () => {
    try {
      const response = await authFetch('http://127.0.0.1:8000/api/inscripciones/');
      if (!response.ok) return;
      const data = await response.json();
      setInscripciones(data);
    } catch {}
  };

  const handleAbrirModal = () => {
    fetchInscripciones();
    setModalOpen(true);
  };

  const handleSubmitPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await authFetch('http://127.0.0.1:8000/api/pagos/pago-simple/', {
        method: 'POST',
        body: JSON.stringify({
          inscripcion_id: parseInt(formPago.inscripcion_id),
          mes: parseInt(formPago.mes),
          anio: parseInt(formPago.anio),
          monto_total: parseFloat(formPago.monto_total),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errMsg = typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Error al registrar pago.';
        toast.error(errMsg);
      } else {
        toast.success(data.mensaje);
        setModalOpen(false);
        setFormPago({ inscripcion_id: '', mes: '', anio: new Date().getFullYear().toString(), monto_total: '' });
        fetchPagos();
      }
    } catch {
      toast.error('Error de conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchPagos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtroMes) params.append('mes', filtroMes);
      if (filtroAnio) params.append('anio', filtroAnio);

      const response = await authFetch(`http://127.0.0.1:8000/api/pagos/?${params}`);
      if (!response.ok) throw new Error('Error al obtener pagos');
      const data = await response.json();
      setPagos(data);
    } catch (err) {
      setError('No se pudieron cargar los pagos.');
    } finally {
      setLoading(false);
    }
  };

  const totalMonto = pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
            <p className="text-gray-500 text-sm mt-1">Panel del Tesorero</p>
          </div>
          <button
            onClick={handleAbrirModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            + Registrar pago
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los meses</option>
              {Object.entries(MESES).map(([num, nombre]) => (
                <option key={num} value={num}>{nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="2020"
              max="2099"
            />
          </div>

          <button
            onClick={() => { setFiltroMes(''); setFiltroAnio(new Date().getFullYear().toString()); }}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total pagos</p>
            <p className="text-2xl font-bold text-gray-900">{pagos.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Monto total</p>
            <p className="text-2xl font-bold text-green-600">${totalMonto.toLocaleString('es-AR')}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Cuotas mensuales</p>
            <p className="text-2xl font-bold text-blue-600">{pagos.filter(p => p.tipo === 'mensual').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Donaciones</p>
            <p className="text-2xl font-bold text-purple-600">{pagos.filter(p => p.tipo === 'donacion').length}</p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading && (
            <div className="p-8 text-center text-gray-400">Cargando pagos...</div>
          )}

          {error && (
            <div className="p-8 text-center text-red-500">{error}</div>
          )}

          {!loading && !error && pagos.length === 0 && (
            <div className="p-8 text-center text-gray-400">No hay pagos para los filtros seleccionados.</div>
          )}

          {!loading && !error && pagos.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Alumno</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">DNI</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Mes</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Año</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Monto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {pago.inscripcion_detalle.usuario.apellido}, {pago.inscripcion_detalle.usuario.nombre}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {pago.inscripcion_detalle.usuario.dni}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIPO_COLOR[pago.tipo]}`}>
                        {TIPO_LABEL[pago.tipo]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {pago.mes ? MESES[pago.mes] : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{pago.anio}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${parseFloat(pago.monto).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(pago.fecha_pago).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Modal registrar pago */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Registrar pago</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <form onSubmit={handleSubmitPago} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alumno (inscripción)</label>
                <select
                  required
                  value={formPago.inscripcion_id}
                  onChange={(e) => setFormPago({ ...formPago, inscripcion_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar alumno...</option>
                  {inscripciones.map((ins) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.usuario.apellido}, {ins.usuario.nombre} — DNI {ins.usuario.dni} ({ins.anio})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <select
                    required
                    value={formPago.mes}
                    onChange={(e) => setFormPago({ ...formPago, mes: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Mes...</option>
                    {Object.entries(MESES).map(([num, nombre]) => (
                      <option key={num} value={num}>{nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input
                    type="number"
                    required
                    value={formPago.anio}
                    onChange={(e) => setFormPago({ ...formPago, anio: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2020"
                    max="2099"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto recibido ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formPago.monto_total}
                  onChange={(e) => setFormPago({ ...formPago, monto_total: e.target.value })}
                  placeholder="Ej: 10000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Si es mayor a la cuota, el excedente se registra como donación. Si es menor, todo va a donación.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg"
                >
                  {submitting ? 'Registrando...' : 'Confirmar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
