import { cn } from '../../utils/cn';

interface Props {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: Props) => {
  let label = status;
  let colorClass = 'bg-slate-100 text-slate-700';

  switch (status) {
    case 'ACTIVE':
    case 'AVAILABLE':
      label = status === 'ACTIVE' ? 'Activo' : 'Disponible';
      colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      break;
    case 'INACTIVE':
      label = 'Inactivo';
      colorClass = 'bg-slate-100 text-slate-800 border-slate-200';
      break;
    case 'DISCONTINUED':
      label = 'Descontinuado';
      colorClass = 'bg-red-50 text-red-700 border-red-200';
      break;
    case 'LOW_STOCK':
      label = 'Stock Bajo';
      colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
      break;
    case 'OUT_OF_STOCK':
      label = 'Agotado';
      colorClass = 'bg-red-100 text-red-800 border-red-200';
      break;
  }

  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', colorClass, className)}>
      {label}
    </span>
  );
};
