import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Pencil, Plus, Save, User, X } from 'lucide-react';
import {
  useAssignBranchRoute,
  useCustomerBranchOptions,
  useCustomers,
  useSaveBranch,
  useUpdateBranchImage,
  useUploadBranchImage,
} from '../../customers/hooks/useCustomers';
import { CustomerBranchFormModal } from '../../customers/components/CustomerBranchFormModal';
import { useRoute, useRoutes, useSaveRoute } from '../hooks/useRouteOperations';
import { LoadingState } from '../../../components/ui/LoadingState';
import { SearchSelect } from '../../../components/ui/SearchSelect';
import { AlertModal } from '../../../components/ui/AlertModal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import type { BranchFormValues, CustomerBranchOption, CustomerRouteOption } from '../../customers/services/customers.service';

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

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getLocatedBranches = (branches: CustomerBranchOption[]) => {
  return branches
    .map((branch) => ({
      ...branch,
      latitude: toNumber(branch.latitude),
      longitude: toNumber(branch.longitude),
    }))
    .filter(
      (branch): branch is CustomerBranchOption & { latitude: number; longitude: number } =>
        branch.latitude !== null && branch.longitude !== null,
    );
};

const getMapBounds = (branches: Array<CustomerBranchOption & { latitude: number; longitude: number }>) => {
  const locatedBranches = branches
    .map((branch) => ({ latitude: branch.latitude, longitude: branch.longitude }));

  const latitudes = locatedBranches.map((branch) => branch.latitude);
  const longitudes = locatedBranches.map((branch) => branch.longitude);

  return {
    minLat: Math.min(...latitudes),
    maxLat: Math.max(...latitudes),
    minLng: Math.min(...longitudes),
    maxLng: Math.max(...longitudes),
  };
};

const markerStyle = (
  branch: CustomerBranchOption & { latitude: number; longitude: number },
  branches: Array<CustomerBranchOption & { latitude: number; longitude: number }>,
) => {
  if (!branches.length) {
    return { left: '50%', top: '50%' };
  }

  const bounds = getMapBounds(branches);
  const latRange = bounds.maxLat - bounds.minLat || 0.01;
  const lngRange = bounds.maxLng - bounds.minLng || 0.01;

  return {
    left: `${((branch.longitude - bounds.minLng) / lngRange) * 82 + 9}%`,
    top: `${(1 - (branch.latitude - bounds.minLat) / latRange) * 76 + 12}%`,
  };
};

export const RouteFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data: route, isLoading: isRouteLoading } = useRoute(id || null);
  const { data: routes = [] } = useRoutes();
  const { data: branchOptions = [] } = useCustomerBranchOptions();
  const { data: customers = [] } = useCustomers({});
  const saveRoute = useSaveRoute();
  const assignBranchRoute = useAssignBranchRoute();
  const saveBranch = useSaveBranch();
  const uploadBranchImage = useUploadBranchImage();
  const updateBranchImage = useUpdateBranchImage();
  const [form, setForm] = useState(emptyForm);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [branchDialog, setBranchDialog] = useState<{ mode: 'create' } | { mode: 'edit'; branch: CustomerBranchOption } | null>(null);
  const [branchError, setBranchError] = useState('');
  const [branchToRemove, setBranchToRemove] = useState<CustomerBranchOption | null>(null);
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
  const locatedBranches = getLocatedBranches(assignedBranches);
  const routeOptionsForBranches = routes as CustomerRouteOption[];
  const branchSearchOptions = branchOptions
    .filter((branch) => branch.is_active)
    .map((branch) => {
      const customerName = branch.customers?.name || 'Sin cliente';
      const location = [branch.municipality, branch.state].filter(Boolean).join(', ');
      const routeLabel = branch.routes ? `Asignada a ${branch.routes.code}` : 'Sin ruta';

      return {
        value: branch.id,
        label: branch.name,
        description: `${customerName}${location ? ` - ${location}` : ''} - ${routeLabel}`,
        keywords: `${branch.name} ${customerName} ${branch.phone_primary || ''} ${branch.municipality || ''} ${branch.state || ''}`,
      };
    });

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

  const assignSelectedBranch = async (branchId: string) => {
    if (!routeId) return;
    setAlertModal((current) => ({ ...current, isOpen: false }));

    try {
      setSelectedBranchId(branchId);
      await assignBranchRoute.mutateAsync({ branchId, routeId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo asignar la sucursal.';
      setAlertModal({
        isOpen: true,
        title: 'No se pudo asignar la sucursal',
        message,
        type: 'error',
      });
    } finally {
      setSelectedBranchId('');
    }
  };

  const handleSaveBranch = async (payload: BranchFormValues, imageFile: File | null) => {
    setBranchError('');

    try {
      const savedBranch = await saveBranch.mutateAsync(payload);

      if (imageFile) {
        const imagePath = await uploadBranchImage.mutateAsync({ branchId: savedBranch.id, file: imageFile });
        await saveBranch.mutateAsync({ ...payload, id: savedBranch.id, image_path: imagePath });
      }

      setBranchDialog(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la sucursal.';
      setBranchError(message);
    }
  };

  const handleBranchImageUpload = async (branchId: string, file: File) => {
    const imagePath = await uploadBranchImage.mutateAsync({ branchId, file });
    await updateBranchImage.mutateAsync({ branchId, imagePath });
    return imagePath;
  };

  const removeBranchFromRoute = async () => {
    if (!branchToRemove) return;

    try {
      await assignBranchRoute.mutateAsync({ branchId: branchToRemove.id, routeId: null });
      setBranchToRemove(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo quitar la sucursal de la ruta.';
      setAlertModal({
        isOpen: true,
        title: 'No se pudo quitar la sucursal',
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
              Datos de la ruta, sucursales asignadas y mapa operativo.
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)]">
        <div className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#1D1D1F]">Sucursales de la ruta</h3>
              <p className="mt-0.5 text-[13px] text-[#86868B]">Busca por sucursal, cliente, teléfono o ubicación.</p>
            </div>
            {routeId && (
              <button
                type="button"
                onClick={() => {
                  setBranchError('');
                  setBranchDialog({ mode: 'create' });
                }}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-semibold text-[#1D1D1F] transition-colors hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
                Nueva sucursal
              </button>
            )}
          </div>

          {routeId ? (
            <div className="space-y-3">
              <SearchSelect
                label="Agregar sucursal"
                options={branchSearchOptions}
                value={selectedBranchId}
                placeholder="Buscar sucursal o cliente"
                emptyMessage="No hay sucursales con ese texto"
                disabled={assignBranchRoute.isPending}
                onChange={assignSelectedBranch}
                onClear={() => setSelectedBranchId('')}
              />

              {!assignedBranches.length ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-[#F5F5F7] px-3 py-6 text-center text-[13px] text-[#86868B]">
                  Esta ruta aún no tiene sucursales asignadas.
                </div>
              ) : (
                <div className="grid gap-2">
                  {assignedBranches.map((branch) => (
                    <BranchRouteCard
                      key={branch.id}
                      branch={branch}
                      isPending={assignBranchRoute.isPending}
                      onEdit={() => {
                        setBranchError('');
                        setBranchDialog({ mode: 'edit', branch });
                      }}
                      onRemove={() => setBranchToRemove(branch)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-[#F5F5F7] px-3 py-6 text-center text-[13px] text-[#86868B]">
              Guarda la ruta para poder agregar sucursales.
            </div>
          )}
        </div>

        <RouteBranchesMap branches={assignedBranches} locatedBranches={locatedBranches} />
      </section>

      {branchDialog && routeId && (
        <CustomerBranchFormModal
          branch={branchDialog.mode === 'edit' ? branchDialog.branch : null}
          customers={customers}
          defaultRouteId={routeId}
          routeOptions={routeOptionsForBranches}
          isPending={saveBranch.isPending || uploadBranchImage.isPending || updateBranchImage.isPending}
          errorMessage={branchError}
          onClose={() => setBranchDialog(null)}
          onImageUpload={handleBranchImageUpload}
          onSubmit={handleSaveBranch}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(branchToRemove)}
        onClose={() => setBranchToRemove(null)}
        onConfirm={() => void removeBranchFromRoute()}
        title="Quitar sucursal de la ruta"
        message={`La sucursal ${branchToRemove?.name || ''} quedará sin ruta asignada.`}
        confirmText="Quitar"
        isDestructive
        isPending={assignBranchRoute.isPending}
      />

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

const BranchRouteCard = ({
  branch,
  isPending,
  onEdit,
  onRemove,
}: {
  branch: CustomerBranchOption;
  isPending: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) => (
  <article className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <p className="truncate text-[13px] font-semibold text-[#1D1D1F]">
        <Building2 className="mr-1.5 inline h-3.5 w-3.5 text-[#0066CC]" />
        {branch.name}
      </p>
      <p className="mt-1 truncate text-[12px] text-[#86868B]">
        <User className="mr-1.5 inline h-3.5 w-3.5" />
        {branch.customers?.name || 'Sin cliente'} - {[branch.municipality, branch.state].filter(Boolean).join(', ') || 'Ubicación pendiente'}
      </p>
    </div>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-[#424245] transition-colors hover:bg-gray-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={isPending}
        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-[#424245] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        <X className="h-3.5 w-3.5" />
        Quitar
      </button>
    </div>
  </article>
);

const RouteBranchesMap = ({
  branches,
  locatedBranches,
}: {
  branches: CustomerBranchOption[];
  locatedBranches: Array<CustomerBranchOption & { latitude: number; longitude: number }>;
}) => (
  <aside className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-4">
      <h3 className="inline-flex items-center gap-2 text-base font-semibold text-[#1D1D1F]">
        <MapPin className="h-5 w-5 text-[#0066CC]" />
        Mapa de sucursales
      </h3>
      <p className="mt-0.5 text-[13px] text-[#86868B]">
        {locatedBranches.length} de {branches.length} sucursales tienen coordenadas.
      </p>
    </div>

    {locatedBranches.length ? (
      <div className="relative min-h-[360px] overflow-hidden rounded-xl border border-gray-200 bg-[#EEF3F8]">
        <div className="absolute left-[8%] top-[18%] h-[68%] w-[2px] rotate-[24deg] rounded-full bg-white/80" />
        <div className="absolute left-[22%] top-[12%] h-[2px] w-[72%] rotate-[-10deg] rounded-full bg-white/80" />
        <div className="absolute left-[14%] top-[68%] h-[2px] w-[72%] rotate-[6deg] rounded-full bg-white/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(0,102,204,0.08),transparent_28%),radial-gradient(circle_at_80%_68%,rgba(52,199,89,0.10),transparent_30%)]" />
        <div className="absolute inset-0">
          {locatedBranches.map((branch, index) => (
            <a
              key={branch.id}
              href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
              target="_blank"
              rel="noreferrer"
              style={markerStyle(branch, locatedBranches)}
              className="absolute z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0066CC] text-[12px] font-bold text-white shadow-lg ring-4 ring-white transition-transform hover:scale-110"
              title={branch.name}
            >
              {index + 1}
            </a>
          ))}
        </div>
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-gray-300 bg-[#F5F5F7] px-3 py-10 text-center text-[13px] text-[#86868B]">
        Agrega coordenadas a las sucursales para verlas en el mapa.
      </div>
    )}

    {!!locatedBranches.length && (
      <div className="mt-3 grid gap-2">
        {locatedBranches.map((branch, index) => (
          <a
            key={branch.id}
            href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-[12px] transition-colors hover:bg-[#F5F5F7]"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0066CC] text-[10px] font-bold text-white">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-[#1D1D1F]">{branch.name}</span>
          </a>
        ))}
      </div>
    )}
  </aside>
);

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
