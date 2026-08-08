import { Loader2 } from 'lucide-react';

interface Props {
  message?: string;
  className?: string;
}

export const LoadingState = ({ message = 'Cargando...', className = '' }: Props) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 min-h-[200px] ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
};
