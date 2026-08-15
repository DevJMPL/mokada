import { cn } from '../../utils/cn';

interface Props {
  status: string;
  className?: string;
  text?: string;
}

export const StatusBadge = ({ status, className, text }: Props) => {
  let label = text || status;
  let colorClass = 'bg-gray-100 text-gray-700';

  switch (status) {
    case 'ACTIVE':
    case 'AVAILABLE':
      label = text || (status === 'ACTIVE' ? 'Activo' : 'Disponible');
      colorClass = 'bg-green-500/10 text-green-700';
      break;
    case 'INACTIVE':
      label = text || 'Inactivo';
      colorClass = 'bg-gray-500/10 text-gray-700';
      break;
    case 'DISCONTINUED':
      label = text || 'Descontinuado';
      colorClass = 'bg-red-500/10 text-red-700';
      break;
    case 'LOW_STOCK':
      label = text || 'Stock Bajo';
      colorClass = 'bg-orange-500/10 text-orange-700';
      break;
    case 'OUT_OF_STOCK':
      label = text || 'Agotado';
      colorClass = 'bg-red-500/10 text-red-700';
      break;
    // Fleet vehicle statuses
    case 'ASSIGNED':
      label = 'Asignado';
      colorClass = 'bg-blue-500/10 text-blue-700';
      break;
    case 'MAINTENANCE':
      label = 'Mantenimiento';
      colorClass = 'bg-amber-500/10 text-amber-700';
      break;
    case 'OUT_OF_SERVICE':
      label = 'Fuera de servicio';
      colorClass = 'bg-red-500/10 text-red-700';
      break;
    // Route trip statuses
    case 'PLANNED':
      label = 'Planeado';
      colorClass = 'bg-slate-500/10 text-slate-700';
      break;
    case 'IN_PROGRESS':
      label = 'En progreso';
      colorClass = 'bg-blue-500/10 text-blue-700';
      break;
    case 'COMPLETED':
      label = 'Completado';
      colorClass = 'bg-green-500/10 text-green-700';
      break;
    case 'UNDER_REVIEW':
      label = 'En revisión';
      colorClass = 'bg-purple-500/10 text-purple-700';
      break;
    case 'SETTLED':
      label = 'Liquidado';
      colorClass = 'bg-teal-500/10 text-teal-700';
      break;
    case 'CANCELLED':
      label = 'Cancelado';
      colorClass = 'bg-red-500/10 text-red-700';
      break;
    // Expense statuses
    case 'DRAFT':
      label = 'Borrador';
      colorClass = 'bg-gray-500/10 text-gray-700';
      break;
    case 'SUBMITTED':
      label = 'Enviado';
      colorClass = 'bg-blue-500/10 text-blue-700';
      break;
    case 'APPROVED':
      label = 'Aprobado';
      colorClass = 'bg-green-500/10 text-green-700';
      break;
    case 'REJECTED':
      label = 'Rechazado';
      colorClass = 'bg-red-500/10 text-red-700';
      break;
    case 'REQUIRES_INFORMATION':
      label = 'Requiere info';
      colorClass = 'bg-amber-500/10 text-amber-700';
      break;
    case 'PENDING':
      label = 'Pendiente';
      colorClass = 'bg-yellow-500/10 text-yellow-700';
      break;
    // Settlement types
    case 'BALANCED':
      label = 'Balanceado';
      colorClass = 'bg-green-500/10 text-green-700';
      break;
    case 'AGENT_RETURNS_CASH':
      label = 'Agente devuelve';
      colorClass = 'bg-amber-500/10 text-amber-700';
      break;
    case 'COMPANY_REIMBURSES':
      label = 'Empresa reembolsa';
      colorClass = 'bg-blue-500/10 text-blue-700';
      break;
  }

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase', colorClass, className)}>
      {label}
    </span>
  );
};
