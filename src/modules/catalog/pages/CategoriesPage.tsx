import { useCategories } from '../hooks/useCatalog';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const CategoriesPage = () => {
  const { data, isLoading } = useCategories();

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'code', className: 'font-medium text-slate-900' },
    { header: 'Categoría', accessorKey: 'name' },
    { header: 'Descripción', accessorKey: 'description' },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Categorías</h2>
        <p className="text-slate-500">Gestión de jerarquía de categorías</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay categorías"
        emptyMessage="Aún no se han registrado categorías en el sistema."
      />
    </div>
  );
};
