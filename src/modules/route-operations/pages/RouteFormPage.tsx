import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Save } from 'lucide-react';
import { useCustomerBranchOptions } from '../../customers/hooks/useCustomers';
import { useRoute, useSaveRoute } from '../hooks/useRouteOperations';
import { LoadingState } from '../../../components/ui/LoadingState';
import { AlertModal } from '../../../components/ui/AlertModal';
import type { CustomerBranchOption } from '../../customers/services/customers.service';

const DAYS = [
  { value: 'L', label: 'L', title: 'Lunes' },
  { value: 'M', label: 'M', title: 'Martes' },
  { value: 'X', label: 'M', title: 'Miércoles' },
  { value: 'J', label: 'J', title: 'Jueves' },
  { value: 'V', label: 'V', title: 'Viernes' },
  { value: 'S', label: 'S', title: 'Sábado' },
  { value: 'D', label: 'D', title: 'Domingo' },
];

const emptyForm = {
  code: '',
  name: '',
  description: '',
  working_days: ['L', 'M', 'X', 'J', 'V'] as string[],
  default_weekly_budget: 0,
  is_active: true,
};

const getRouteMapUrl = (branches: CustomerBranchOption[]) => {
  const points = branches
    .map((branch) => ({ latitude: Number(branch.latitude), longitude: Number(branch.longitude) }))
    .filter((branch) => Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude))
    .map((branch) => `${branch.latitude},${branch.longitude}`);

  if (!points.length) return null;
  if (points.length === 1) return `https://www.google.com/maps/search/?api=1&query=${points[0]}`;

  const params = new URLSearchParams({
    api: '1',
    origin: points[0],
    destination: points[points.length - 1],
  });

  if (points.length > 2) params.set('waypoints', points.slice(1, -1).join('|'));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

export const RouteFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data: route, isLoading: isRouteLoading } = useRoute(id || null);
  const { data: branchOptions = [] } = useCustomerBranchOptions();
  const saveRoute = useSaveRoute();
  const [form, setForm] = useState(emptyForm);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  });

  useEffect(() => {
    if (!route) return;

    setForm({
      code: route.code || '',
      name: route.name || '',
      description: route.description || '',
      working_days: route.working_days || ['L', 'M', 'X', 'J', 'V'],
      default_weekly_budget: route.default_weekly_budget || 0,
      is_active: route.is_active ?? true,
    });
  }, [route]);

  if (isEditing && isRouteLoading) return <LoadingState message="Cargando ruta..." />;

  const routeId = id || null;
  const assignedBranches = branchOptions.filter((branch) => branch.route_id === routeId);
  const routeMapUrl = getRouteMapUrl(assignedBranches);

  const toggleDay = (day: string) => {
    setForm((current) => {
      const currentDays = current.working_days || [];
      if (currentDays.includes(day)) {
        return { ...current, working_days: currentDays.filter((item) => item !== day) };
      }

      const nextDays = [...currentDays, day];
      return { ...current, working_days: DAYS.filter((item) => nextDays.includes(item.value)).map((item) => item.value) };
    });
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlertModal((current) => ({ ...current, isOpen: false }));

    try {
      const savedRoute = await saveRoute.mutateAsync({ id, ...form });

      if (!id) {
        navigate(`/route-operations/routes/${savedRoute.id}`, { replace: true });
        return;
      }

      setAlertModal({
        isOpen: true,
        title: 'Ruta actualizada',
        message: 'Los cambios de la ruta se guardaron correctamente.',
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la ruta.';
      setAlertModal({
        isOpen: true,
        title: 'No se pudo guardar la ruta',
        message,
        type: 'error',
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            to="/route-operations/routes"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#86868B] transition-colors hover:bg-gray-200/50 hover:text-[#1D1D1F]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-[26px] font-bold tracking-tight text-[#1D1D1F] sm:text-[28px]">
              {isEditing ? 'Editar ruta' : 'Nueva ruta'}
            </h2>
            <p className="mt-1 text-[14px] text-[#86868B] sm:text-[15px]">
              Datos de la ruta y sucursales asignadas.
            </p>
          </div>
        </div>

        <button
          type="submit"
          form="route-form"
          disabled={saveRoute.isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0066CC] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0057AD] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Save className="h-4 w-4" />
          {saveRoute.isPending ? 'Guardando...' : 'Guardar ruta'}
        </button>
      </div>

      <form id="route-form" onSubmit={handleSave} className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput label="Código *" value={form.code} maxLength={30} onChange={(value) => setForm((current) => ({ ...current, code: value }))} />
          <TextInput label="Nombre *" value={form.name} maxLength={90} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
          <label className="block min-w-0 sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">Descripción</span>
            <textarea
              value={form.description}
              maxLength={240}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[14px] outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]"
            />
          </label>
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">Días laborales</span>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => {
                const selected = form.working_days.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    title={day.title}
                    onClick={() => toggleDay(day.value)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                      selected ? 'bg-[#0066CC] text-white shadow-sm' : 'bg-[#F5F5F7] text-[#86868B] hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
          <TextInput
            label="Presupuesto semanal"
            type="number"
            value={String(form.default_weekly_budget)}
            min="0"
            step="100"
            onChange={(value) => setForm((current) => ({ ...current, default_weekly_budget: Number(value) }))}
          />
        </div>
        <label className="mt-4 flex h-10 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
          />
          <span className="text-sm font-medium text-[#1D1D1F]">Ruta activa</span>
        </label>
      </form>

      {isEditing && (
        <section className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F]">Detalles de ruta</h3>
              <p className="mt-0.5 text-[13px] text-[#86868B]">
                {routeMapUrl
                  ? 'Abre el recorrido con las coordenadas disponibles.'
                  : 'No hay sucursales con coordenadas para abrir el mapa.'}
              </p>
            </div>
            <a
              href={routeMapUrl || undefined}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!routeMapUrl}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors ${
                routeMapUrl
                  ? 'bg-[#0066CC] text-white hover:bg-[#0057AD]'
                  : 'pointer-events-none bg-gray-200 text-gray-400'
              }`}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir mapa
            </a>
          </div>
        </section>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((current) => ({ ...current, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

const TextInput = ({
  label,
  value,
  onChange,
  type = 'text',
  min,
  step,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  min?: string;
  step?: string;
  maxLength?: number;
}) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">{label}</span>
    <input
      type={type}
      value={value}
      required={label.includes('*')}
      min={min}
      step={step}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full min-w-0 rounded-lg border border-gray-200 px-3 text-[14px] outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC]"
    />
  </label>
);
