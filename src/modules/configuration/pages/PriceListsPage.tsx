import { usePriceLists } from '../hooks/useConfig';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const PriceListsPage = () => {
  const { data, isLoading } = usePriceLists();

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'code', className: 'font-medium text-slate-900' },
    { header: 'Nombre', accessorKey: 'name' },
    { 
      header: 'Descuento (%)', 
      cell: (item) => `${item.discount_percentage}%`,
      className: 'text-right'
    },
    { header: 'Moneda', accessorKey: 'currency' },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Listas de Precios</h2>
        <p className="text-[15px] text-[#86868B]">Configuración de niveles de precios y descuentos</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay listas de precios"
        emptyMessage="Aún no se han registrado listas de precios en el sistema."
      />
    </div>
  );
};
