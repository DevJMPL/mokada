import { useMovements, useWarehouses } from '../hooks/useInventory';
import { Table, type Column } from '../../../components/ui/Table';
import { formatDate, formatQuantity, formatCurrency } from '../../../utils/formatters';
import { MovementFormModal } from '../components/MovementFormModal';
import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';

export const MovementsPage = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const { data, isLoading } = useMovements(selectedWarehouse || undefined);
  const { data: warehouses } = useWarehouses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<any>[] = [
    { 
      header: 'Fecha', 
      cell: (item) => <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span> 
    },
    { 
      header: 'Producto', 
      cell: (item) => (
        <div>
          <p className="font-medium text-slate-900">{item.products?.code}</p>
          <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.products?.name}</p>
        </div>
      )
    },
    { 
      header: 'Tipo', 
      cell: (item) => (
        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {item.movement_type}
        </span>
      )
    },
    { 
      header: 'Cantidad', 
      cell: (item) => {
        const isPositive = ['PURCHASE', 'RETURN_IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'INITIAL_STOCK'].includes(item.movement_type);
        return (
          <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : '-'}{formatQuantity(item.quantity)}
          </span>
        );
      },
      className: 'text-right'
    },
    { 
      header: 'Almacén', 
      cell: (item) => item.warehouses?.name 
    },
    { 
      header: 'Costo Unit.', 
      cell: (item) => item.unit_cost ? formatCurrency(item.unit_cost) : '-',
      className: 'text-right text-slate-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Movimientos</h2>
          <p className="text-[15px] text-[#86868B]">Historial de entradas y salidas de inventario</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-[13px] text-gray-700 shadow-sm transition-all appearance-none cursor-pointer hover:bg-gray-50"
            >
              <option value="">Todos los almacenes</option>
              {warehouses?.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0055FF] transition-colors text-[14px] font-medium"
          >
            <Plus className="w-4 h-4" />
            Ajuste Manual
          </button>
        </div>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay movimientos"
        emptyMessage="Aún no se han registrado movimientos de inventario."
      />

      <MovementFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
