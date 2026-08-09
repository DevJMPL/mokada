import { Modal } from './Modal';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success';
}

export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'error'
}: Props) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-6 h-6" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6" />;
      case 'info':
      default:
        return <Info className="w-6 h-6" />;
    }
  };

  const getColorClass = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-600';
      case 'success':
        return 'bg-emerald-50 text-emerald-600';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="px-1 text-center">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${getColorClass()}`}>
          {getIcon()}
        </div>
        
        <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{title}</h3>
        <p className="text-[14px] text-[#86868B]">{message}</p>
      </div>

      <div className="mt-8 flex justify-center pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-8 py-2 text-[14px] font-medium text-white bg-[#0066CC] rounded-lg hover:bg-[#0055FF] transition-colors"
        >
          Aceptar
        </button>
      </div>
    </Modal>
  );
};
