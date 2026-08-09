import { Modal } from '../../../components/ui/Modal';
import { useTransferFull } from '../hooks/useInventory';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatDate } from '../../../utils/formatters';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  transferId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
}

export const TransferDetailsModal = ({ transferId, isOpen, onClose, onComplete }: Props) => {
  const { data: transfer, isLoading } = useTransferFull(transferId);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Traspaso" size="lg">
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066CC]"></div>
        </div>
      ) : transfer ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1D1D1F]">{transfer.transfer_number}</h3>
              <p className="text-[13px] text-[#86868B]">{formatDate(transfer.created_at)}</p>
            </div>
            <StatusBadge status={transfer.status} />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">Origen</p>
              <p className="text-[14px] font-medium text-[#1D1D1F]">{transfer.source?.name}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 mx-4" />
            <div className="flex-1 text-right">
              <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">Destino</p>
              <p className="text-[14px] font-medium text-[#1D1D1F]">{transfer.destination?.name}</p>
            </div>
          </div>

          {transfer.notes && (
            <div>
              <p className="text-[12px] font-semibold text-[#86868B] uppercase mb-1">Notas</p>
              <p className="text-[14px] text-[#1D1D1F] bg-gray-50 p-3 rounded-lg border border-gray-100">
                {transfer.notes}
              </p>
            </div>
          )}

          <div>
            <p className="text-[12px] font-semibold text-[#86868B] uppercase mb-3">Productos Involucrados</p>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-600">Código</th>
                    <th className="px-4 py-2 font-medium text-gray-600">Producto</th>
                    <th className="px-4 py-2 font-medium text-gray-600 text-right">Cantidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transfer.items?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1D1D1F]">{item.products?.code}</td>
                      <td className="px-4 py-3 text-gray-600">{item.products?.name}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1D1D1F]">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {transfer.status === 'DRAFT' && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  onClose();
                  onComplete(transfer.id);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Registrar Movimiento en Inventario
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500 text-[14px]">
          No se pudo cargar la información del traspaso.
        </div>
      )}
    </Modal>
  );
};
