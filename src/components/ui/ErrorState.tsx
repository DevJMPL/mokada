import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({ 
  title = 'Ha ocurrido un error', 
  message = 'No pudimos cargar la información. Por favor, intenta de nuevo.',
  onRetry 
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-red-50/50 border border-red-100 rounded-lg min-h-[300px]">
      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-red-900 mb-1">{title}</h3>
      <p className="text-sm text-red-600 max-w-sm mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Reintentar
        </button>
      )}
    </div>
  );
};
