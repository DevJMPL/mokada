import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransfers, useCompleteTransfer } from '../hooks/useInventory';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { AlertModal } from '../../../components/ui/AlertModal';
import { TransferDetailsModal } from '../components/TransferDetailsModal';
import { formatDate } from '../../../utils/formatters';
import { Plus, CheckCircle2, Eye } from 'lucide-react';

export const TransfersPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useTransfers();
  const { mutateAsync: completeTransfer, isPending: isCompleting } = useCompleteTransfer();
  
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; transferId: string | null }>({
    isOpen: false,
    transferId: null
  });

  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; transferId: string | null }>({
    isOpen: false,
    transferId: null
  });

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  const handleComplete = async () => {
    if (!confirmModal.transferId) return;
    
    try {
      await completeTransfer(confirmModal.transferId);
      setConfirmModal({ isOpen: false, transferId: null });
    } catch (error: any) {
      console.error('Error al completar traspaso:', error);
      setConfirmModal({ isOpen: false, transferId: null });
      
      const errMsg = error?.message || '';
      if (errMsg.includes('INSUFFICIENT_STOCK:')) {
        const detail = errMsg.split('INSUFFICIENT_STOCK: ')[1];
        setAlertModal({
          isOpen: true,
          title: 'Stock Insuficiente',
          message: detail,
          type: 'error'
        });
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Error de Sistema',
          message: 'Hubo un error al completar el traspaso.',
          type: 'error'
        });
      }
    }
  };

  const columns: Column<any>[] = [
    { header: 'No. Traspaso', accessorKey: 'transfer_number', className: 'font-medium text-slate-900' },
    { 
      header: 'Fecha', 
      cell: (item) => <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span> 
    },
    { header: 'Origen', cell: (item) => item.source?.name },
    { header: 'Destino', cell: (item) => item.destination?.name },
    { 
      header: 'Partidas', 
      cell: (item) => <span className="text-slate-600">{item.items?.[0]?.count || 0} artículos</span> 
    },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.status} />
    },
    {
      header: '',
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDetailsModal({ isOpen: true, transferId: item.id })}
            className="p-1.5 text-gray-400 hover:text-[#0066CC] hover:bg-blue-50 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          {item.status === 'DRAFT' && (
            <button 
              onClick={() => setConfirmModal({ isOpen: true, transferId: item.id })}
              disabled={isCompleting}
              className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Completar
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Traspasos</h2>
          <p className="text-[15px] text-[#86868B]">Movimiento de inventario entre almacenes</p>
        </div>

        <button
          onClick={() => navigate('/inventory/transfers/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0055FF] transition-colors text-[14px] font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Traspaso
        </button>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay traspasos"
        emptyMessage="Aún no se han registrado traspasos entre almacenes."
      />

      <TransferDetailsModal
        isOpen={detailsModal.isOpen}
        transferId={detailsModal.transferId}
        onClose={() => setDetailsModal({ isOpen: false, transferId: null })}
        onComplete={(id) => setConfirmModal({ isOpen: true, transferId: id })}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, transferId: null })}
        onConfirm={handleComplete}
        title="Completar Traspaso"
        message="¿Estás seguro de completar este traspaso? El inventario se descontará del almacén origen y se agregará al almacén destino. Esta acción no se puede deshacer."
        confirmText="Completar Traspaso"
        isPending={isCompleting}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};
