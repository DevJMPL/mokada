import { useStock } from '../hooks/useInventory';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatQuantity } from '../../../utils/formatters';

export const StockPage = () => {
  const { data, isLoading } = useStock();

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'product_code', className: 'font-medium text-slate-900' },
    { header: 'Producto', accessorKey: 'product_name' },
    { header: 'Almacén', accessorKey: 'warehouse' },
    { 
      header: 'Existencia', 
      cell: (item) => formatQuantity(item.quantity || 0),
      className: 'text-right'
    },
    { 
      header: 'Reservado', 
      cell: (item) => formatQuantity(item.reserved_quantity || 0),
      className: 'text-right'
    },
    { 
      header: 'Disponible', 
      cell: (item) => <span className="font-semibold text-emerald-600">{formatQuantity(item.available_quantity || 0)}</span>,
      className: 'text-right'
    },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.availability_status} />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Existencias</h2>
        <p className="text-[15px] text-[#86868B]">Consulta de inventario disponible por almacén</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay existencias"
        emptyMessage="El inventario se encuentra vacío."
      />
    </div>
  );
};
