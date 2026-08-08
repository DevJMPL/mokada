import { FolderSearch } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState = ({ 
  title = 'No hay datos', 
  description = 'No se encontraron registros para mostrar.',
  icon,
  action
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="w-12 h-12 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
        {icon || <FolderSearch className="w-6 h-6 text-gray-400" />}
      </div>
      <h3 className="text-lg font-semibold text-[#1D1D1F] tracking-tight">{title}</h3>
      <p className="mt-1 text-[13px] text-[#86868B] max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
