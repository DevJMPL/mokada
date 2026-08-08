import { useMovements } from '../hooks/useInventory';
import { Table, type Column } from '../../../components/ui/Table';
import { formatDate, formatQuantity, formatCurrency } from '../../../utils/formatters';

export const MovementsPage = () => {
  const { data, isLoading } = useMovements();

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
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Movimientos</h2>
        <p className="text-slate-500">Historial de entradas y salidas de inventario</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay movimientos"
        emptyMessage="Aún no se han registrado movimientos de inventario."
      />
    </div>
  );
};
