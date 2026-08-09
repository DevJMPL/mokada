import { useState } from 'react';
import { useRoutes, useSaveRoute } from '../hooks/useRouteOperations';
import { Table, type Column } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils/formatters';
import { Plus } from 'lucide-react';

const DAYS = [
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'X', label: 'M' },
  { value: 'J', label: 'J' },
  { value: 'V', label: 'V' },
  { value: 'S', label: 'S' },
  { value: 'D', label: 'D' },
];

const EMPTY_FORM = {
  code: '',
  name: '',
  description: '',
  working_days: ['L', 'M', 'X', 'J', 'V'] as string[],
  default_weekly_budget: 0,
  is_active: true,
};

export const RoutesPage = () => {
  const { data, isLoading } = useRoutes();
  const saveRoute = useSaveRoute();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalOpen(true);
  };

  const openEdit = (route: any) => {
    setForm({
      code: route.code || '',
      name: route.name || '',
      description: route.description || '',
      working_days: route.working_days || ['L', 'M', 'X', 'J', 'V'],
      default_weekly_budget: route.default_weekly_budget || 0,
      is_active: route.is_active ?? true,
    });
    setEditId(route.id);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveRoute.mutateAsync({ id: editId, ...form });
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving route', err);
    }
  };

  const toggleDay = (day: string) => {
    setForm(prev => {
      const current = prev.working_days || [];
      if (current.includes(day)) {
        return { ...prev, working_days: current.filter(d => d !== day) };
      } else {
        const newDays = [...current, day];
        const orderedDays = DAYS.filter(d => newDays.includes(d.value)).map(d => d.value);
        return { ...prev, working_days: orderedDays };
      }
    });
  };

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'code', className: 'font-medium text-slate-900' },
    { header: 'Nombre', accessorKey: 'name' },
    { 
      header: 'Días laborales', 
      cell: (item) => (
        <div className="flex gap-1">
          {item.working_days?.map((d: string) => (
            <span key={d} className="w-5 h-5 rounded-full bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center text-[10px] font-bold" title={d === 'X' ? 'Miércoles' : undefined}>
              {d === 'X' ? 'M' : d}
            </span>
          ))}
        </div>
      ) 
    },
    { header: 'Presupuesto', cell: (item) => formatCurrency(Number(item.default_weekly_budget || 0)), className: 'text-right' },
    {
      header: 'Activa',
      cell: (item) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${item.is_active ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}`}>
          {item.is_active ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      header: '',
      cell: (item) => (
        <button onClick={() => openEdit(item)} className="text-[#0066CC] text-[13px] font-medium hover:underline">
          Editar
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Rutas</h2>
          <p className="text-[15px] text-[#86868B]">Definición de rutas comerciales reutilizables</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-[#0066CC] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-[#0055AA] transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva ruta
        </button>
      </div>

      <Table
        data={data || []}
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="Sin rutas"
        emptyMessage="No se han definido rutas comerciales aún."
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Editar ruta' : 'Nueva ruta'} maxWidth="max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Código *</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="RTB-001" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Nombre *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Ruta Bajío" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none resize-none" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Días laborales de la ruta</label>
              <div className="flex gap-1">
                {DAYS.map(day => {
                  const isSelected = form.working_days?.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                        isSelected 
                          ? 'bg-[#0066CC] text-white shadow-sm' 
                          : 'bg-[#F5F5F7] text-[#86868B] hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Presupuesto semanal</label>
              <input type="number" value={form.default_weekly_budget} onChange={e => setForm({ ...form, default_weekly_budget: Number(e.target.value) })} min={0} step="100" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]" />
            <label htmlFor="is_active" className="text-[13px] text-[#1D1D1F]">Ruta activa</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saveRoute.isPending} className="rounded-xl bg-[#0066CC] px-5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#0055AA] disabled:opacity-50 transition-colors">
              {saveRoute.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
