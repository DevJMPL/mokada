import { Modal } from './Modal';
import { AlertTriangle, Info } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isPending?: boolean;
  variant?: 'danger' | 'destructive' | 'warning' | 'info' | string;
}

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  isDestructive = false,
  isPending = false,
  variant
}: Props) => {
  const destructive = isDestructive || variant === 'danger' || variant === 'destructive';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="px-1 text-center">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${destructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          {destructive ? (
            <AlertTriangle className="w-6 h-6" />
          ) : (
            <Info className="w-6 h-6" />
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{title}</h3>
        <p className="text-[14px] text-[#86868B]">{message}</p>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 text-[14px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={`px-4 py-2 text-[14px] font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
            destructive
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-[#0066CC] hover:bg-[#0055FF]'
          }`}
        >
          {isPending ? 'Procesando...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};
