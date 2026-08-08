import { useBrands } from '../hooks/useCatalog';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const BrandsPage = () => {
  const { data, isLoading } = useBrands();

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'code', className: 'font-medium text-slate-900' },
    { header: 'Nombre', accessorKey: 'name' },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Marcas</h2>
        <p className="text-slate-500">Gestión de marcas de refacciones</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay marcas"
        emptyMessage="Aún no se han registrado marcas en el sistema."
      />
    </div>
  );
};
