import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Plus,
  QrCode,
  ReceiptText,
  Route,
  Save,
  ToggleLeft,
  ToggleRight,
  UserRound,
} from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { AlertModal } from '../../../components/ui/AlertModal';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { IconButton } from '../../../components/ui/IconButton';
import mokadaLogo from '../../../assets/logo.svg';
import { createBrandedQrDataUrl } from '../../../utils/qr';
import { CustomerBranchFormModal } from '../components/CustomerBranchFormModal';
import {
  useCustomer,
  useCustomerBranches,
  useCustomerFiscalProfiles,
  useCustomerRoutes,
  useSaveBranch,
  useSaveCustomer,
  useSaveFiscalProfile,
  useToggleBranch,
  useToggleFiscalProfile,
  useUpdateBranchImage,
  useUploadBranchImage,
} from '../hooks/useCustomers';
import {
  customersService,
  fiscalPersonTypeLabels,
  type BranchFormValues,
  type CustomerBranch,
  type CustomerFiscalProfile,
  type CustomerFormValues,
  type CustomerRouteOption,
  type CustomerSummary,
  type FiscalFormValues,
  type FiscalPersonType,
} from '../services/customers.service';

type TabId = 'general' | 'fiscal' | 'branches';
type FiscalDialogState = { mode: 'create' } | { mode: 'edit'; profile: CustomerFiscalProfile };
type BranchDialogState = { mode: 'create' } | { mode: 'edit'; branch: CustomerBranch };
type ConfirmAction =
  | { type: 'fiscal'; profile: CustomerFiscalProfile }
  | { type: 'branch'; branch: CustomerBranch };

interface CredentialNotice {
  email: string;
  password: string;
}

const fiscalRegimeOptions: Array<{
  value: string;
  label: string;
  personTypes: FiscalPersonType[];
}> = [
  { value: '601', label: '601 - GENERAL DE LEY PERSONAS MORALES', personTypes: ['LEGAL_ENTITY'] },
  { value: '603', label: '603 - PERSONAS MORALES CON FINES NO LUCRATIVOS', personTypes: ['LEGAL_ENTITY'] },
  { value: '605', label: '605 - SUELDOS Y SALARIOS E INGRESOS ASIMILADOS A SALARIOS', personTypes: ['INDIVIDUAL'] },
  { value: '606', label: '606 - ARRENDAMIENTO', personTypes: ['INDIVIDUAL'] },
  { value: '607', label: '607 - RÉGIMEN DE ENAJENACIÓN O ADQUISICIÓN DE BIENES', personTypes: ['INDIVIDUAL'] },
  { value: '608', label: '608 - DEMÁS INGRESOS', personTypes: ['INDIVIDUAL'] },
  { value: '610', label: '610 - RESIDENTES EN EL EXTRANJERO SIN ESTABLECIMIENTO PERMANENTE EN MÉXICO', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'] },
  { value: '611', label: '611 - INGRESOS POR DIVIDENDOS', personTypes: ['INDIVIDUAL'] },
  { value: '612', label: '612 - PERSONAS FÍSICAS CON ACTIVIDADES EMPRESARIALES Y PROFESIONALES', personTypes: ['INDIVIDUAL'] },
  { value: '614', label: '614 - INGRESOS POR INTERESES', personTypes: ['INDIVIDUAL'] },
  { value: '615', label: '615 - RÉGIMEN DE LOS INGRESOS POR OBTENCIÓN DE PREMIOS', personTypes: ['INDIVIDUAL'] },
  { value: '616', label: '616 - SIN OBLIGACIONES FISCALES', personTypes: ['INDIVIDUAL'] },
  { value: '620', label: '620 - SOCIEDADES COOPERATIVAS DE PRODUCCIÓN QUE OPTAN POR DIFERIR SUS INGRESOS', personTypes: ['LEGAL_ENTITY'] },
  { value: '621', label: '621 - INCORPORACIÓN FISCAL', personTypes: ['INDIVIDUAL'] },
  { value: '622', label: '622 - ACTIVIDADES AGRÍCOLAS, GANADERAS, SILVÍCOLAS Y PESQUERAS', personTypes: ['LEGAL_ENTITY'] },
  { value: '623', label: '623 - OPCIONAL PARA GRUPOS DE SOCIEDADES', personTypes: ['LEGAL_ENTITY'] },
  { value: '624', label: '624 - COORDINADOS', personTypes: ['LEGAL_ENTITY'] },
  { value: '625', label: '625 - RÉGIMEN DE LAS ACTIVIDADES EMPRESARIALES CON INGRESOS A TRAVÉS DE PLATAFORMAS TECNOLÓGICAS', personTypes: ['INDIVIDUAL'] },
  { value: '626', label: '626 - RÉGIMEN SIMPLIFICADO DE CONFIANZA', personTypes: ['INDIVIDUAL', 'LEGAL_ENTITY'] },
];

const emptyCustomerForm: CustomerFormValues = {
  name: '',
  email: '',
  phone: '',
  requires_invoice: false,
  is_active: true,
};

export const CustomerFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [form, setForm] = useState<CustomerFormValues>(emptyCustomerForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [credentialNotice, setCredentialNotice] = useState<CredentialNotice | null>(
    (location.state as { credentialNotice?: CredentialNotice } | null)?.credentialNotice || null,
  );
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [fiscalDialog, setFiscalDialog] = useState<FiscalDialogState | null>(null);
  const [branchDialog, setBranchDialog] = useState<BranchDialogState | null>(null);
  const [qrBranch, setQrBranch] = useState<CustomerBranch | null>(null);
  const [fiscalError, setFiscalError] = useState('');
  const [branchError, setBranchError] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
  });

  const { data: customer, isLoading: isCustomerLoading, isError, error } = useCustomer(id || null);
  const { data: fiscalProfiles = [], isLoading: isFiscalLoading } = useCustomerFiscalProfiles(id || null);
  const { data: branches = [], isLoading: isBranchesLoading } = useCustomerBranches(id || null);
  const { data: routeOptions = [] } = useCustomerRoutes();

  const saveCustomer = useSaveCustomer();
  const saveFiscalProfile = useSaveFiscalProfile();
  const toggleFiscalProfile = useToggleFiscalProfile();
  const saveBranch = useSaveBranch();
  const toggleBranch = useToggleBranch();
  const uploadBranchImage = useUploadBranchImage();
  const updateBranchImage = useUpdateBranchImage();

  useEffect(() => {
    if (!customer) return;

    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      requires_invoice: customer.requires_invoice,
      is_active: customer.is_active,
    });
  }, [customer]);

  const tabs = useMemo(
    () =>
      [
        { id: 'general' as const, label: 'General' },
        { id: 'fiscal' as const, label: 'Fiscal', disabled: !isEditing },
        { id: 'branches' as const, label: 'Sucursales', disabled: !isEditing },
      ],
    [isEditing],
  );

  const persistCustomer = async () => {
    setErrorMessage('');
    setSavedMessage('');
    setAlertModal((current) => ({ ...current, isOpen: false }));

    try {
      const result = await saveCustomer.mutateAsync({ id, payload: form });

      if (!id) {
        navigate(`/customers/${result.customer.id}`, {
          replace: true,
          state: result.temporary_password
            ? {
                credentialNotice: {
                  email: result.customer.email,
                  password: result.temporary_password,
                },
              }
            : undefined,
        });
        return;
      }

      setSavedMessage('Cliente actualizado.');
      setAlertModal({
        isOpen: true,
        title: 'Cliente actualizado',
        message: 'Los cambios del cliente se guardaron correctamente.',
        type: 'success',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el cliente.';
      setErrorMessage(message);
      setAlertModal({
        isOpen: true,
        title: 'No se pudo guardar el cliente',
        message,
        type: 'error',
      });
    }
  };

  const handleSaveCustomer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void persistCustomer();
  };

  const handleSaveFiscal = async (payload: FiscalFormValues) => {
    setFiscalError('');

    try {
      await saveFiscalProfile.mutateAsync(payload);
      setFiscalDialog(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la información fiscal.';
      setFiscalError(message);
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

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      if (confirmAction.type === 'fiscal') {
        await toggleFiscalProfile.mutateAsync(confirmAction.profile);
      } else {
        await toggleBranch.mutateAsync(confirmAction.branch);
      }

      setConfirmAction(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el registro.';
      setAlertModal({
        isOpen: true,
        title: 'No se pudo completar la acción',
        message,
        type: 'error',
      });
    }
  };

  const copyCredentials = async () => {
    if (!credentialNotice) return;

    await navigator.clipboard.writeText(`${credentialNotice.email}\n${credentialNotice.password}`);
    setCopyState('copied');
    window.setTimeout(() => setCopyState('idle'), 1500);
  };

  if (isEditing && isCustomerLoading) return <LoadingState message="Cargando cliente..." />;

  if (isEditing && isError) {
    const message = error instanceof Error ? error.message : 'No se pudo cargar el cliente.';
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <BackLink />
        <Alert tone="danger">{message}</Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <BackLink />
          <div className="min-w-0">
            <h2 className="text-[26px] font-bold tracking-tight text-[#1D1D1F] sm:text-[28px]">
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="mt-1 text-[14px] text-[#86868B] sm:text-[15px]">
              {isEditing ? 'Contacto, información fiscal y sucursales' : 'Crea el usuario cliente automáticamente'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void persistCustomer()}
          disabled={saveCustomer.isPending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0066CC] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0057AD] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Save className="h-4 w-4" />
          {saveCustomer.isPending ? 'Guardando...' : 'Guardar Cliente'}
        </button>
      </div>

      {credentialNotice && (
        <Alert tone="success" onClose={() => setCredentialNotice(null)}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-emerald-800">Usuario cliente creado</p>
              <p className="mt-0.5 text-[13px] text-emerald-700">
                {credentialNotice.email} - contraseña temporal: {credentialNotice.password}
              </p>
            </div>
            <button
              type="button"
              onClick={copyCredentials}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-[12px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-50"
            >
              {copyState === 'copied' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copyState === 'copied' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </Alert>
      )}

      {errorMessage && <Alert tone="danger" onClose={() => setErrorMessage('')}>{errorMessage}</Alert>}
      {savedMessage && <Alert tone="success" onClose={() => setSavedMessage('')}>{savedMessage}</Alert>}

      <div className="flex w-full gap-1 overflow-x-auto rounded-xl bg-gray-200/50 p-1 sm:max-w-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => setActiveTab(tab.id)}
            className={`h-9 min-w-[110px] flex-1 rounded-lg px-3 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              activeTab === tab.id
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <form
          id="customer-general-form"
          onSubmit={handleSaveCustomer}
          className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6 md:p-8"
        >
          <div className="mb-5 flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E5EFF]">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[#1D1D1F]">Información general</h2>
              <p className="mt-1 text-sm text-[#86868B]">Nombre, correo, teléfono y estado del cliente</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Nombre *"
              value={form.name}
              maxLength={120}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <TextInput
              label="Teléfono"
              type="tel"
              value={form.phone}
              required={false}
              maxLength={20}
              onChange={(value) => setForm((current) => ({ ...current, phone: value }))}
            />
            <TextInput
              label="Correo *"
              type="email"
              value={form.email}
              maxLength={160}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              className="sm:col-span-2"
            />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <CheckboxField
              label="Requiere facturación"
              checked={form.requires_invoice}
              onChange={(checked) => setForm((current) => ({ ...current, requires_invoice: checked }))}
            />
            <CheckboxField
              label="Cliente activo"
              checked={form.is_active}
              onChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))}
            />
          </div>
        </form>
      )}

      {activeTab === 'fiscal' && customer && (
        <RelatedSection
          title="Información fiscal"
          description="RFC, razón social y correo de facturación"
          icon={<ReceiptText className="h-5 w-5" />}
          actionLabel="Agregar fiscal"
          onAction={() => {
            setFiscalError('');
            setFiscalDialog({ mode: 'create' });
          }}
        >
          {isFiscalLoading ? (
            <LoadingBlock label="Cargando información fiscal..." />
          ) : !fiscalProfiles.length ? (
            <InlineEmpty message="Este cliente aún no tiene datos fiscales." />
          ) : (
            <div className="grid gap-3">
              {fiscalProfiles.map((profile) => (
                <FiscalProfileCard
                  key={profile.id}
                  profile={profile}
                  isPending={toggleFiscalProfile.isPending}
                  onEdit={() => {
                    setFiscalError('');
                    setFiscalDialog({ mode: 'edit', profile });
                  }}
                  onToggle={() => setConfirmAction({ type: 'fiscal', profile })}
                />
              ))}
            </div>
          )}
        </RelatedSection>
      )}

      {activeTab === 'branches' && customer && (
        <RelatedSection
          title="Sucursales"
          description="Direcciones, rutas asignadas, imagen y QR"
          icon={<Building2 className="h-5 w-5" />}
          actionLabel="Agregar sucursal"
          onAction={() => {
            setBranchError('');
            setBranchDialog({ mode: 'create' });
          }}
        >
          {isBranchesLoading ? (
            <LoadingBlock label="Cargando sucursales..." />
          ) : !branches.length ? (
            <InlineEmpty message="Este cliente aún no tiene sucursales." />
          ) : (
            <div className="grid gap-3">
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  route={branch.routes || routeOptions.find((routeOption) => routeOption.id === branch.route_id) || null}
                  isPending={toggleBranch.isPending}
                  onEdit={() => {
                    setBranchError('');
                    setBranchDialog({ mode: 'edit', branch });
                  }}
                  onShowQr={() => setQrBranch(branch)}
                  onToggle={() => setConfirmAction({ type: 'branch', branch })}
                />
              ))}
            </div>
          )}
        </RelatedSection>
      )}

      {fiscalDialog && customer && (
        <FiscalFormModal
          customer={customer}
          profile={fiscalDialog.mode === 'edit' ? fiscalDialog.profile : null}
          isPending={saveFiscalProfile.isPending}
          errorMessage={fiscalError}
          onClose={() => setFiscalDialog(null)}
          onSubmit={handleSaveFiscal}
        />
      )}

      {branchDialog && customer && (
        <CustomerBranchFormModal
          fixedCustomer={customer}
          branch={branchDialog.mode === 'edit' ? branchDialog.branch : null}
          routeOptions={routeOptions}
          isPending={saveBranch.isPending || uploadBranchImage.isPending || updateBranchImage.isPending}
          errorMessage={branchError}
          onClose={() => setBranchDialog(null)}
          onImageUpload={handleBranchImageUpload}
          onSubmit={handleSaveBranch}
        />
      )}

      {qrBranch && (
        <BranchQrModal
          branch={qrBranch}
          customer={customer || null}
          onClose={() => setQrBranch(null)}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => void handleConfirmAction()}
        title={
          confirmAction?.type === 'fiscal'
            ? confirmAction.profile.is_active
              ? 'Desactivar información fiscal'
              : 'Activar información fiscal'
            : confirmAction?.branch.is_active
              ? 'Desactivar sucursal'
              : 'Activar sucursal'
        }
        message={
          confirmAction?.type === 'fiscal'
            ? confirmAction.profile.is_active
              ? `La información fiscal ${confirmAction.profile.rfc} dejará de estar activa.`
              : `La información fiscal ${confirmAction.profile.rfc} volverá a estar activa.`
            : confirmAction?.branch.is_active
              ? `La sucursal ${confirmAction.branch.name} dejará de estar activa.`
              : `La sucursal ${confirmAction?.branch.name || ''} volverá a estar activa.`
        }
        confirmText={
          confirmAction?.type === 'fiscal'
            ? confirmAction.profile.is_active
              ? 'Desactivar'
              : 'Activar'
            : confirmAction?.branch.is_active
              ? 'Desactivar'
              : 'Activar'
        }
        isDestructive={
          confirmAction?.type === 'fiscal'
            ? confirmAction.profile.is_active
            : Boolean(confirmAction?.branch.is_active)
        }
        isPending={toggleFiscalProfile.isPending || toggleBranch.isPending}
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

const BackLink = () => (
  <Link
    to="/customers"
    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#86868B] transition-colors hover:bg-gray-200/50 hover:text-[#1D1D1F]"
  >
    <ArrowLeft className="h-5 w-5" />
  </Link>
);

const getFiscalRegimeLabel = (value: string) =>
  fiscalRegimeOptions.find((option) => option.value === value)?.label || value;

const FiscalProfileCard = ({
  profile,
  isPending,
  onEdit,
  onToggle,
}: {
  profile: CustomerFiscalProfile;
  isPending: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) => (
  <article className="rounded-lg border border-gray-200/70 bg-white p-3">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-[#1D1D1F]">{profile.legal_name}</h4>
          {profile.is_default && <SmallBadge label="Predeterminado" />}
          <StatusBadge status={profile.is_active ? 'ACTIVE' : 'INACTIVE'} />
        </div>
        <p className="mt-1 text-[12px] font-medium text-[#0066CC]">{profile.rfc}</p>
        <p className="mt-1 text-[12px] text-[#86868B]">
          {fiscalPersonTypeLabels[profile.person_type]} - {getFiscalRegimeLabel(profile.tax_regime)} - CP {profile.fiscal_zip_code}
        </p>
        <p className="mt-1 truncate text-[12px] text-[#424245]">{profile.billing_email}</p>
      </div>
      <div className="flex justify-end gap-2">
        <IconButton title="Editar" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </IconButton>
        <IconButton title={profile.is_active ? 'Desactivar' : 'Activar'} onClick={onToggle} disabled={isPending}>
          {profile.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
        </IconButton>
      </div>
    </div>
  </article>
);

const BranchCard = ({
  branch,
  route,
  isPending,
  onEdit,
  onShowQr,
  onToggle,
}: {
  branch: CustomerBranch;
  route: CustomerRouteOption | null;
  isPending: boolean;
  onEdit: () => void;
  onShowQr: () => void;
  onToggle: () => void;
}) => {
  const address = formatAddress(branch);
  const imageUrl = customersService.getBranchImageUrl(branch.image_path);
  const mapUrl =
    branch.latitude !== null && branch.longitude !== null
      ? `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`
      : null;

  return (
    <article className="rounded-lg border border-gray-200/70 bg-white p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-[#F5F5F7]">
            {imageUrl ? (
              <img src={imageUrl} alt={branch.name} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-6 w-6 text-[#86868B]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-sm font-semibold text-[#1D1D1F]">{branch.name}</h4>
              {branch.is_main && <SmallBadge label="Principal" />}
              <StatusBadge status={branch.is_active ? 'ACTIVE' : 'INACTIVE'} />
            </div>
            <p className="mt-1 text-[12px] text-[#424245]">{branch.manager_name || 'Sin encargado'}</p>
            <p className="mt-1 text-[12px] text-[#86868B]">
              {branch.phone_primary}
              {branch.phone_secondary ? ` / ${branch.phone_secondary}` : ''}
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] text-[#424245]">{address || 'Dirección pendiente'}</p>
            {route && (
              <p className="mt-1 inline-flex max-w-full items-center gap-1.5 text-[12px] font-medium text-[#0066CC]">
                <Route className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {route.code} - {route.name}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <IconButton
            title={mapUrl ? 'Ver mapa' : 'Sin coordenadas'}
            disabled={!mapUrl}
            onClick={() => {
              if (!mapUrl) return;
              window.open(mapUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            <MapPin className="h-4 w-4" />
          </IconButton>
          <IconButton title="QR de sucursal" onClick={onShowQr}>
            <QrCode className="h-4 w-4" />
          </IconButton>
          <IconButton title="Editar" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton title={branch.is_active ? 'Desactivar' : 'Activar'} onClick={onToggle} disabled={isPending}>
            {branch.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </IconButton>
        </div>
      </div>
    </article>
  );
};

const FiscalFormModal = ({
  customer,
  profile,
  isPending,
  errorMessage,
  onClose,
  onSubmit,
}: {
  customer: CustomerSummary;
  profile: CustomerFiscalProfile | null;
  isPending: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (payload: FiscalFormValues) => void;
}) => {
  const [form, setForm] = useState<FiscalFormValues>({
    id: profile?.id,
    customer_id: customer.id,
    person_type: profile?.person_type || 'LEGAL_ENTITY',
    rfc: profile?.rfc || '',
    legal_name: profile?.legal_name || '',
    tax_regime: profile?.tax_regime || '',
    fiscal_zip_code: profile?.fiscal_zip_code || '',
    billing_email: profile?.billing_email || customer.email,
    is_default: profile?.is_default || false,
    is_active: profile?.is_active ?? true,
  });
  const availableRegimes = fiscalRegimeOptions.filter((option) => option.personTypes.includes(form.person_type));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal isOpen onClose={onClose} title={profile ? 'Editar información fiscal' : 'Nueva información fiscal'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">Tipo de persona</span>
            <select
              value={form.person_type}
              onChange={(event) =>
                setForm((current) => {
                  const personType = event.target.value as FiscalPersonType;
                  const currentRegimeIsValid = fiscalRegimeOptions
                    .find((option) => option.value === current.tax_regime)
                    ?.personTypes.includes(personType);

                  return {
                    ...current,
                    person_type: personType,
                    tax_regime: currentRegimeIsValid ? current.tax_regime : '',
                  };
                })
              }
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/15"
            >
              <option value="INDIVIDUAL">Persona física</option>
              <option value="LEGAL_ENTITY">Persona moral</option>
            </select>
          </label>
          <TextInput
            label="RFC"
            value={form.rfc}
            maxLength={13}
            onChange={(value) => setForm((current) => ({ ...current, rfc: value.toUpperCase() }))}
          />
          <TextInput
            label="Nombre o razón social"
            value={form.legal_name}
            maxLength={160}
            onChange={(value) => setForm((current) => ({ ...current, legal_name: value }))}
            className="sm:col-span-2"
          />
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">Régimen fiscal</span>
            <select
              value={form.tax_regime}
              onChange={(event) => setForm((current) => ({ ...current, tax_regime: event.target.value }))}
              required
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/15"
            >
              <option value="" disabled>
                Selecciona un régimen
              </option>
              {availableRegimes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <TextInput
            label="Código postal fiscal"
            value={form.fiscal_zip_code}
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            onChange={(value) =>
              setForm((current) => ({ ...current, fiscal_zip_code: value.replace(/\D/g, '').slice(0, 5) }))
            }
          />
          <TextInput
            label="Correo de facturación"
            type="email"
            value={form.billing_email}
            maxLength={160}
            onChange={(value) => setForm((current) => ({ ...current, billing_email: value }))}
            className="sm:col-span-2"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <CheckboxField
            label="Datos predeterminados"
            checked={form.is_default}
            onChange={(checked) => setForm((current) => ({ ...current, is_default: checked }))}
          />
          <CheckboxField
            label="Registro activo"
            checked={form.is_active}
            onChange={(checked) => setForm((current) => ({ ...current, is_active: checked }))}
          />
        </div>

        {errorMessage && <FormError message={errorMessage} />}
        <ModalActions onClose={onClose} submitLabel="Guardar fiscal" isPending={isPending} />
      </form>
    </Modal>
  );
};

const BranchQrModal = ({
  branch,
  customer,
  onClose,
}: {
  branch: CustomerBranch;
  customer: CustomerSummary | null;
  onClose: () => void;
}) => {
  const [qrUrl, setQrUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const routeLabel = branch.routes ? `${branch.routes.code} - ${branch.routes.name}` : 'Sin ruta';
  const customerName = customer?.name || branch.customers?.name || 'Cliente';
  const payload = useMemo(() => {
    const params = new URLSearchParams({ branch: branch.id });
    if (branch.route_id) params.set('route', branch.route_id);
    return `${window.location.origin}/customers/${branch.customer_id}?${params.toString()}`;
  }, [branch.customer_id, branch.id, branch.route_id]);

  useEffect(() => {
    let isMounted = true;
    setQrUrl('');
    setQrError('');

    createBrandedQrDataUrl({ payload, logoUrl: mokadaLogo })
      .then((dataUrl) => {
        if (isMounted) setQrUrl(dataUrl);
      })
      .catch((error) => {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'No se pudo generar el QR.';
          setQrError(message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [payload]);

  const downloadQr = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    const fileName = branch.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
    link.href = qrUrl;
    link.download = `qr-${fileName || 'sucursal'}.png`;
    link.click();
  };

  return (
    <Modal isOpen onClose={onClose} title="QR de sucursal" size="lg">
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-[#F5F5F7] p-3">
          <p className="truncate text-sm font-semibold text-[#1D1D1F]">{customerName}</p>
          <p className="mt-1 truncate text-[12px] text-[#86868B]">{routeLabel}</p>
        </div>
        <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
          {qrError ? (
            <FormError message={qrError} />
          ) : qrUrl ? (
            <img src={qrUrl} alt={`QR ${branch.name}`} className="h-auto w-full max-w-[320px]" />
          ) : (
            <LoadingBlock label="Generando QR..." />
          )}
        </div>
        <div className="grid gap-2 sm:flex sm:justify-end">
          <a
            href={payload}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-[#1D1D1F] transition-colors hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir enlace
          </a>
          <button
            type="button"
            onClick={downloadQr}
            disabled={!qrUrl}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0066CC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0057AD] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <Download className="h-4 w-4" />
            Descargar QR
          </button>
        </div>
      </div>
    </Modal>
  );
};

const RelatedSection = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel: string;
  onAction: () => void;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200/60 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0066CC]/10 text-[#0066CC]">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-[#1D1D1F]">{title}</h3>
          <p className="mt-0.5 text-[13px] text-[#86868B]">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-[13px] font-semibold text-[#1D1D1F] transition-colors hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
        {actionLabel}
      </button>
    </div>
    {children}
  </div>
);

const TextInput = ({
  label,
  value,
  onChange,
  type = 'text',
  required = true,
  className = '',
  step,
  min,
  max,
  maxLength,
  pattern,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
  step?: string;
  min?: string;
  max?: string;
  maxLength?: number;
  pattern?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal';
}) => (
  <label className={`block min-w-0 ${className}`}>
    <span className="mb-1.5 block text-[13px] font-medium text-[#1D1D1F]">{label}</span>
    <input
      type={type}
      value={value}
      required={required}
      step={step}
      min={min}
      max={max}
      maxLength={maxLength}
      pattern={pattern}
      inputMode={inputMode}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full min-w-0 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/15"
    />
  </label>
);

const CheckboxField = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex h-10 items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-[#0066CC] focus:ring-[#0066CC]"
    />
    <span className="text-sm font-medium text-[#1D1D1F]">{label}</span>
  </label>
);

const ModalActions = ({
  onClose,
  submitLabel,
  isPending,
}: {
  onClose: () => void;
  submitLabel: string;
  isPending: boolean;
}) => (
  <div className="grid gap-2 border-t border-gray-200 pt-4 sm:flex sm:justify-end">
    <button
      type="button"
      onClick={onClose}
      className="h-10 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-[#1D1D1F] transition-colors hover:bg-gray-50"
    >
      Cancelar
    </button>
    <button
      type="submit"
      disabled={isPending}
      className="h-10 rounded-lg bg-[#0066CC] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0057AD] disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {isPending ? 'Guardando...' : submitLabel}
    </button>
  </div>
);

const Alert = ({
  tone,
  children,
  onClose,
}: {
  tone: 'danger' | 'success';
  children: ReactNode;
  onClose?: () => void;
}) => {
  const colorClass =
    tone === 'danger' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  return (
    <div className={`rounded-lg border px-3 py-2 text-[13px] ${colorClass}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{children}</div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/70"
            title="Cerrar"
          >
            x
          </button>
        )}
      </div>
    </div>
  );
};

const FormError = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{message}</div>
);

const SmallBadge = ({ label }: { label: string }) => (
  <span className="rounded-full bg-[#0066CC]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#0066CC]">
    {label}
  </span>
);

const LoadingBlock = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-gray-200 bg-[#F5F5F7] px-3 py-4 text-center text-sm text-[#86868B]">
    {label}
  </div>
);

const InlineEmpty = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-[#F5F5F7] px-3 py-5 text-center text-sm text-[#86868B]">
    {message}
  </div>
);

const formatAddress = (branch: CustomerBranch) => {
  return [
    branch.street,
    branch.exterior_number ? `Ext. ${branch.exterior_number}` : null,
    branch.interior_number ? `Int. ${branch.interior_number}` : null,
    branch.neighborhood,
    branch.postal_code ? `CP ${branch.postal_code}` : null,
    branch.municipality,
    branch.state,
  ]
    .filter(Boolean)
    .join(', ');
};
