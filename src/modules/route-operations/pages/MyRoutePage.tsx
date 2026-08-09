import { useState } from 'react';
import { useAuth } from '../../auth/context/useAuth';
import { useMyCurrentTrip, useTripExpenses, useSaveExpense, useExpenseCategories, useUpdateTripStatus, useUploadExpenseAttachment } from '../hooks/useRouteOperations';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils/formatters';
import { MapPin, DollarSign, Plus, Truck, Upload } from 'lucide-react';

export const MyRoutePage = () => {
  const { profile } = useAuth();
  const { data: trip, isLoading } = useMyCurrentTrip(profile?.id || null);
  const { data: expenses } = useTripExpenses(trip?.id || null);
  const { data: categories } = useExpenseCategories();
  const saveExpense = useSaveExpense();
  const updateStatus = useUpdateTripStatus();
  const uploadAttachment = useUploadExpenseAttachment();
  const [expenseModal, setExpenseModal] = useState(false);
  const [form, setForm] = useState({
    expense_category_id: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
    merchant_name: '',
    place_name: '',
    city: '',
    state: '',
    invoice_available: false,
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  if (isLoading) return <LoadingState message="Buscando ruta asignada..." />;
  if (!trip) return <EmptyState title="Sin ruta asignada" description="No tienes una ruta asignada para esta semana." />;

  const totalExpenses = expenses?.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 0;
  const budget = Number(trip.budget_amount || 0);
  const available = budget - totalExpenses;
  const startDate = new Date(trip.week_start_date + 'T12:00:00');
  const endDate = new Date(trip.week_end_date + 'T12:00:00');

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expense = await saveExpense.mutateAsync({
        ...form,
        route_trip_id: trip.id,
        agent_id: profile?.id,
        created_by: profile?.id,
        status: 'SUBMITTED',
      });

      if (attachmentFile && expense) {
        await uploadAttachment.mutateAsync({
          expense: { id: expense.id, route_trip_id: trip.id },
          file: attachmentFile,
          attachmentType: 'RECEIPT',
          uploadedBy: profile?.id || '',
        });
      }

      setExpenseModal(false);
      setForm({
        expense_category_id: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        description: '',
        merchant_name: '',
        place_name: '',
        city: '',
        state: '',
        invoice_available: false,
      });
      setAttachmentFile(null);
    } catch (err) {
      console.error('Error saving expense', err);
    }
  };

  const handleStartTrip = () => {
    updateStatus.mutate({ id: trip.id, status: 'IN_PROGRESS' });
  };

  const handleCompleteTrip = () => {
    updateStatus.mutate({ id: trip.id, status: 'COMPLETED' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Mi Ruta</h2>
        <p className="text-[15px] text-[#86868B]">
          {startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} – {endDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Route info */}
      <div className="bg-white border border-gray-200/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#86868B]">Ruta asignada</p>
            <p className="text-[20px] font-bold text-[#1D1D1F]">{trip.routes?.code} — {trip.routes?.name}</p>
          </div>
          <StatusBadge status={trip.status} />
        </div>
        {trip.vehicle && (
          <div className="flex items-center gap-2 text-[14px] text-[#86868B]">
            <Truck className="w-4 h-4" />
            <span>{trip.vehicle.internal_code} — {trip.vehicle.brand} {trip.vehicle.model} ({trip.vehicle.plate_number})</span>
          </div>
        )}
      </div>

      {/* Budget bar */}
      <div className="bg-white border border-gray-200/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-medium text-[#1D1D1F]">Presupuesto</span>
          <span className="text-[14px] font-semibold text-[#1D1D1F]">{formatCurrency(budget)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
          <div
            className={`h-3 rounded-full transition-all ${totalExpenses > budget ? 'bg-red-500' : 'bg-[#0066CC]'}`}
            style={{ width: `${Math.min((totalExpenses / budget) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[13px] text-[#86868B]">
          <span>Gastado: {formatCurrency(totalExpenses)}</span>
          <span className={available >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            Disponible: {formatCurrency(available)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {trip.status === 'ASSIGNED' && (
          <button onClick={handleStartTrip} disabled={updateStatus.isPending} className="flex-1 rounded-xl bg-[#0066CC] py-3 text-[14px] font-semibold text-white hover:bg-[#0055AA] transition-colors">
            Iniciar Ruta
          </button>
        )}
        {trip.status === 'IN_PROGRESS' && (
          <>
            <button onClick={() => setExpenseModal(true)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0066CC] py-3 text-[14px] font-semibold text-white hover:bg-[#0055AA] transition-colors">
              <Plus className="w-4 h-4" /> Registrar gasto
            </button>
            <button onClick={handleCompleteTrip} disabled={updateStatus.isPending} className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-[14px] font-semibold text-[#1D1D1F] hover:bg-gray-50 transition-colors">
              Finalizar
            </button>
          </>
        )}
      </div>

      {/* Expenses list */}
      <div className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-[17px] font-semibold text-[#1D1D1F] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#0066CC]" /> Mis gastos
          </h3>
        </div>
        {expenses && expenses.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {expenses.map((exp: any) => (
              <div key={exp.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#86868B]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#1D1D1F]">{exp.expense_categories?.name}</p>
                    <p className="text-[12px] text-[#86868B]">{exp.place_name || exp.description || '—'} · {new Date(exp.expense_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-semibold text-[#1D1D1F]">{formatCurrency(Number(exp.amount))}</p>
                  <StatusBadge status={exp.status} className="text-[10px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-[#86868B]">Aún no registras gastos.</div>
        )}
      </div>

      {/* Add expense modal */}
      <Modal isOpen={expenseModal} onClose={() => setExpenseModal(false)} title="Registrar gasto" maxWidth="max-w-lg">
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Categoría *</label>
            <select value={form.expense_category_id} onChange={e => setForm({ ...form, expense_category_id: e.target.value })} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none bg-white">
              <option value="">Seleccionar</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Monto (MXN) *</label>
              <input type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} min={0.01} step="0.01" required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Fecha *</label>
              <input type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Lugar</label>
            <input value={form.place_name} onChange={e => setForm({ ...form, place_name: e.target.value })} placeholder="Ej. Gasolinera Pemex Querétaro" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Ciudad</label>
              <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Estado</label>
              <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none resize-none" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Comercio / Proveedor</label>
            <input value={form.merchant_name} onChange={e => setForm({ ...form, merchant_name: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] outline-none" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1">Evidencia (recibo/foto)</label>
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-3 text-[13px] text-[#86868B] hover:border-[#0066CC] hover:text-[#0066CC] transition-colors">
              <Upload className="w-4 h-4" />
              {attachmentFile ? attachmentFile.name : 'Seleccionar archivo o tomar foto'}
              <input
                type="file"
                accept="image/*,application/pdf,.xml"
                capture="environment"
                onChange={e => setAttachmentFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="has_invoice" checked={form.invoice_available} onChange={e => setForm({ ...form, invoice_available: e.target.checked })} className="rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]" />
            <label htmlFor="has_invoice" className="text-[13px] text-[#1D1D1F]">¿Tiene factura?</label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setExpenseModal(false)} className="px-4 py-2 text-[13px] font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saveExpense.isPending} className="rounded-xl bg-[#0066CC] px-5 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-[#0055AA] disabled:opacity-50 transition-colors">
              {saveExpense.isPending ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
