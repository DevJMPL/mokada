import { useVehicles } from '../hooks/useCatalog';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export const VehiclesPage = () => {
  const { data, isLoading } = useVehicles();

  const columns: Column<any>[] = [
    { 
      header: 'Marca', 
      cell: (item) => <span className="font-medium text-slate-900">{item.vehicle_makes?.name}</span>
    },
    { header: 'Modelo', accessorKey: 'name' },
    { header: 'Generación', accessorKey: 'generation' },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Vehículos</h2>
        <p className="text-[15px] text-[#86868B]">Catálogo de marcas y modelos automotrices</p>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay vehículos"
        emptyMessage="Aún no se han registrado vehículos en el sistema."
      />
    </div>
  );
};
