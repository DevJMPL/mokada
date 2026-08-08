import { useAttributes } from '../hooks/useConfig';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const AttributesPage = () => {
  const { data, isLoading } = useAttributes();

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'code', className: 'font-medium text-slate-900' },
    { header: 'Atributo', accessorKey: 'name' },
    { header: 'Tipo de Dato', accessorKey: 'data_type' },
    { header: 'Unidad', accessorKey: 'unit' },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Atributos</h2>
        <p className="text-slate-500">Definición de atributos dinámicos para productos</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay atributos"
        emptyMessage="Aún no se han definido atributos dinámicos en el sistema."
      />
    </div>
  );
};
