import { useUnits } from '../hooks/useConfig';
import { Table, type Column } from '../../../components/ui/Table';

export const UnitsPage = () => {
  const { data, isLoading } = useUnits();

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'code', className: 'font-medium text-slate-900' },
    { header: 'Nombre', accessorKey: 'name' },
    { 
      header: 'Permite Decimales', 
      cell: (item) => item.allows_decimals ? 'Sí' : 'No'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Unidades de Medida</h2>
        <p className="text-[15px] text-[#86868B]">Configuración de unidades para inventario</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay unidades"
        emptyMessage="Aún no se han registrado unidades de medida en el sistema."
      />
    </div>
  );
};
