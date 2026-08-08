import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
  className?: string;
}

export const LoadingState = ({ message = 'Cargando...', className = '' }: Props) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-[#86868B] min-h-[200px] bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
      <Loader2 className="w-6 h-6 animate-spin text-[#0066CC] mb-3" />
      <p className="text-[13px]">{message}</p>
    </div>
  );
};
