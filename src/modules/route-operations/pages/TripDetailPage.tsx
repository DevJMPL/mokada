import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase/client';
import { routeKeys, expenseKeys } from '../../../utils/queryKeys';
import { useRouteTrip, useTripExpenses, useUpdateTripStatus, useUpdateExpenseStatus } from '../hooks/useRouteOperations';
import { storageService } from '../../../lib/supabase/storage';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency } from '../../../utils/formatters';
import { ArrowLeft, MapPin, DollarSign, Truck, User, CalendarDays, Paperclip } from 'lucide-react';

export const TripDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: trip, isLoading } = useRouteTrip(id || null);
  const { data: expenses } = useTripExpenses(id || null);
  const updateStatus = useUpdateTripStatus();
  const updateExpenseStatus = useUpdateExpenseStatus();
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const expenseChannel = supabase
      .channel(`trip-expenses-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'travel_expenses', filter: `route_trip_id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: expenseKeys.tripExpenses(id) });
          queryClient.invalidateQueries({ queryKey: routeKeys.trip(id) });
        }
      )
      .subscribe();

    const tripChannel = supabase
      .channel(`trip-updates-${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'route_trips', filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: routeKeys.trip(id) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(expenseChannel);
      supabase.removeChannel(tripChannel);
    };
  }, [id, queryClient]);

  if (isLoading) return <LoadingState message="Cargando viaje..." />;
  if (!trip) return <div className="text-center py-12 text-[#86868B]">Viaje no encontrado</div>;

  const totalExpenses = expenses?.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 0;
  const budget = Number(trip.budget_amount || 0);
  const balance = budget - totalExpenses; // Updated in real time

  const startDate = new Date(trip.week_start_date + 'T12:00:00');
  const endDate = new Date(trip.week_end_date + 'T12:00:00');

  const handleViewEvidence = async (path: string) => {
    try {
      const url = await storageService.createSignedUrl('expense-evidence', path);
      setEvidenceUrl(url);
    } catch (error) {
      console.error('Error fetching evidence url:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/route-operations/trips" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#86868B]" />
        </Link>
        <div className="flex-1">
          <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">
            {trip.routes?.code} — {trip.routes?.name}
          </h2>
          <p className="text-[15px] text-[#86868B]">
            {startDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })} – {endDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#86868B] mb-2">
            <User className="w-4 h-4" /> <span className="text-[12px] font-medium uppercase tracking-wide">Agente</span>
          </div>
          <p className="text-[17px] font-semibold text-[#1D1D1F]">{trip.agent?.first_name} {trip.agent?.last_name}</p>
        </div>
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#86868B] mb-2">
            <Truck className="w-4 h-4" /> <span className="text-[12px] font-medium uppercase tracking-wide">Unidad</span>
          </div>
          <p className="text-[17px] font-semibold text-[#1D1D1F]">{trip.vehicle?.internal_code || '—'}</p>
          <p className="text-[13px] text-[#86868B]">{trip.vehicle?.brand} {trip.vehicle?.model}</p>
        </div>
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#86868B] mb-2">
            <DollarSign className="w-4 h-4" /> <span className="text-[12px] font-medium uppercase tracking-wide">Presupuesto</span>
          </div>
          <p className="text-[17px] font-semibold text-[#1D1D1F]">{formatCurrency(budget)}</p>
          <p className="text-[13px] text-[#86868B]">Gastado: {formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white border border-gray-200/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-[#86868B] mb-2">
            <CalendarDays className="w-4 h-4" /> <span className="text-[12px] font-medium uppercase tracking-wide">Saldo</span>
          </div>
          <p className={`text-[17px] font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </p>
          <p className="text-[13px] text-[#86868B]">{balance > 0 ? 'Agente devuelve' : balance < 0 ? 'Empresa reembolsa' : 'Balanceado'}</p>
        </div>
      </div>

      {/* Status actions */}
      {trip.status === 'COMPLETED' && (
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus.mutate({ id: trip.id, status: 'UNDER_REVIEW' })}
            disabled={updateStatus.isPending}
            className="rounded-xl bg-purple-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Enviar a revisión
          </button>
        </div>
      )}

      {/* Stops / Itinerary */}
      {trip.stops && trip.stops.length > 0 && (
        <div className="bg-white border border-gray-200/60 rounded-2xl p-6">
          <h3 className="text-[17px] font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#0066CC]" /> Itinerario
          </h3>
          <div className="space-y-3">
            {trip.stops.map((stop: any, idx: number) => (
              <div key={stop.id} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0066CC]/10 text-[#0066CC] text-[12px] font-bold shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#1D1D1F]">{stop.client_branches?.name || 'Parada'}</p>
                  <p className="text-[12px] text-[#86868B]">{stop.client_branches?.city}, {stop.client_branches?.state}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses */}
      <div className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Gastos registrados</h3>
          <span className="text-[13px] text-[#86868B]">{expenses?.length || 0} registros</span>
        </div>
        {expenses && expenses.length > 0 ? (
          <table className="w-full text-[13px] text-left">
            <thead className="bg-white border-b border-gray-200/60 text-[#86868B] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Fecha</th>
                <th className="px-5 py-3.5">Categoría</th>
                <th className="px-5 py-3.5">Lugar</th>
                <th className="px-5 py-3.5">Descripción</th>
                <th className="px-5 py-3.5 text-right">Monto</th>
                <th className="px-5 py-3.5 text-center">Factura</th>
                <th className="px-5 py-3.5 text-center">Evidencias</th>
                <th className="px-5 py-3.5">Estado</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((exp: any) => (
                <tr key={exp.id} className="hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="px-5 py-3.5">{new Date(exp.expense_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-5 py-3.5 font-medium">{exp.expense_categories?.name}</td>
                  <td className="px-5 py-3.5">{exp.place_name || exp.city || '—'}</td>
                  <td className="px-5 py-3.5 max-w-[200px] truncate">{exp.description || '—'}</td>
                  <td className="px-5 py-3.5 text-right font-medium">{formatCurrency(Number(exp.amount))}</td>
                  <td className="px-5 py-3.5 text-center">{exp.invoice_available ? '✓' : '—'}</td>
                  <td className="px-5 py-3.5 text-center">
                    {exp.expense_attachments?.length > 0 && (
                      <button 
                        onClick={() => handleViewEvidence(exp.expense_attachments[0].storage_path)}
                        className="inline-flex items-center gap-1 text-[#0066CC] hover:underline"
                      >
                        <Paperclip className="w-3.5 h-3.5" /> {exp.expense_attachments.length}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={exp.status} /></td>
                  <td className="px-5 py-3.5">
                    {trip.status === 'UNDER_REVIEW' && exp.status === 'SUBMITTED' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateExpenseStatus.mutate({ id: exp.id, status: 'APPROVED' })} className="text-green-600 text-[12px] font-medium hover:underline">Aprobar</button>
                        <button onClick={() => updateExpenseStatus.mutate({ id: exp.id, status: 'REJECTED' })} className="text-red-600 text-[12px] font-medium hover:underline">Rechazar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-8 text-center text-[#86868B]">No hay gastos registrados para este viaje.</div>
        )}
      </div>

      <Modal isOpen={!!evidenceUrl} onClose={() => setEvidenceUrl(null)} title="Evidencia del gasto" maxWidth="max-w-3xl">
        {evidenceUrl && (
          <div className="flex justify-center bg-gray-50 rounded-lg p-2 min-h-[300px]">
            {evidenceUrl.includes('.pdf') ? (
               <iframe src={evidenceUrl} className="w-full h-[600px] rounded-lg" title="PDF Evidencia" />
            ) : (
               <img src={evidenceUrl} alt="Evidencia" className="max-h-[600px] object-contain rounded-lg shadow-sm" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
