import { cn } from '../../utils/cn';

interface Props {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: Props) => {
  let label = status;
  let colorClass = 'bg-gray-100 text-gray-700';

  switch (status) {
    case 'ACTIVE':
    case 'AVAILABLE':
      label = status === 'ACTIVE' ? 'Activo' : 'Disponible';
      colorClass = 'bg-green-500/10 text-green-700';
      break;
    case 'INACTIVE':
      label = 'Inactivo';
      colorClass = 'bg-gray-500/10 text-gray-700';
      break;
    case 'DISCONTINUED':
      label = 'Descontinuado';
      colorClass = 'bg-red-500/10 text-red-700';
      break;
    case 'LOW_STOCK':
      label = 'Stock Bajo';
      colorClass = 'bg-orange-500/10 text-orange-700';
      break;
    case 'OUT_OF_STOCK':
      label = 'Agotado';
      colorClass = 'bg-red-500/10 text-red-700';
      break;
  }

  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase', colorClass, className)}>
      {label}
    </span>
  );
};
