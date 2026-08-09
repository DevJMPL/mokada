import { useState } from 'react';
import { useRouteTrips, useSaveRouteTrip, useRoutes, useAgents, useAvailableVehicles } from '../hooks/useRouteOperations';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils/formatters';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const EMPTY_FORM = {
  route_id: '',
  agent_id: '',
  vehicle_id: '',
  week_start_date: '',
  week_end_date: '',
  budget_amount: 0,
  status: 'PLANNED' as string,
  notes: '',
};

export const RouteTripsPage = () => {
  const { data, isLoading } = useRouteTrips();
  const saveTrip = useSaveRouteTrip();
  const { data: routes } = useRoutes();
  const { data: agents } = useAgents();
  const { data: vehicles } = useAvailableVehicles();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalOpen(true);
  };

  const handleRouteChange = (routeId: string) => {
    const route = routes?.find((r: any) => r.id === routeId);
    setForm({
      ...form,
      route_id: routeId,
      budget_amount: route?.default_weekly_budget || 0,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveTrip.mutateAsync({ id: editId, ...form });
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving trip', err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Ruta',
      cell: (item) => (
        <Link to={`/route-operations/trips/${item.id}`} className="text-[#0066CC] font-medium hover:underline">
          {item.routes?.code} — {item.routes?.name}
        </Link>
      ),
    },
    {
      header: 'Agente',
      cell: (item) => item.agent ? `${item.agent.first_name} ${item.agent.last_name}` : '—',
    },
    {
      header: 'Unidad',
      cell: (item) => item.vehicle ? `${item.vehicle.internal_code}` : '—',
    },
    {
      header: 'Semana',
      cell: (item) => {
        const start = new Date(item.week_start_date + 'T12:00:00');
        const end = new Date(item.week_end_date + 'T12:00:00');
        return `${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
      },
    },
    {
      header: 'Presupuesto',
      cell: (item) => formatCurrency(Number(item.budget_amount || 0)),
      className: 'text-right',
    },
    { header: 'Estado', cell: (item) => <StatusBadge status={item.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Viajes Semanales</h2>
          <p className="text-[15px] text-[#86868B]">Asignación de rutas, agentes y unidades por semana</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-[#0066CC] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#0055AA] transition-colors">
          <Plus className="w-4 h-4" /> Nuevo viaje
        </button>
      </div>

      <Table
        data={data || []}
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="Sin viajes"
        emptyMessage="No se han asignado viajes semanales aún."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar viaje' : 'Nuevo viaje semanal'} maxWidth="max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Ruta *</label>
            <select value={form.route_id} onChange={e => handleRouteChange(e.target.value)} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none bg-white">
              <option value="">Seleccionar ruta</option>
              {routes?.map((r: any) => (
                <option key={r.id} value={r.id}>{r.code} — {r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Agente *</label>
            <select value={form.agent_id} onChange={e => setForm({ ...form, agent_id: e.target.value })} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none bg-white">
              <option value="">Seleccionar agente</option>
              {agents?.map((a: any) => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Unidad</label>
            <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none bg-white">
              <option value="">Sin asignar</option>
              {vehicles?.map((v: any) => (
                <option key={v.id} value={v.id}>{v.internal_code} — {v.plate_number} ({v.brand} {v.model})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Inicio de semana *</label>
              <input type="date" value={form.week_start_date} onChange={e => setForm({ ...form, week_start_date: e.target.value })} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Fin de semana *</label>
              <input type="date" value={form.week_end_date} onChange={e => setForm({ ...form, week_end_date: e.target.value })} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Presupuesto (MXN)</label>
            <input type="number" value={form.budget_amount} onChange={e => setForm({ ...form, budget_amount: Number(e.target.value) })} min={0} step="100" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saveTrip.isPending} className="rounded-xl bg-[#0066CC] px-5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#0055AA] disabled:opacity-50 transition-colors">
              {saveTrip.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
