import { useBrands } from '../hooks/useCatalog';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { BrandFormModal } from '../components/BrandFormModal';
import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';

export const BrandsPage = () => {
  const { data, isLoading } = useBrands();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  const handleEdit = (brand: any) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const columns: Column<any>[] = [
    { header: 'Código', accessorKey: 'code', className: 'font-medium text-slate-900' },
    { header: 'Nombre', accessorKey: 'name' },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.is_active ? 'ACTIVE' : 'INACTIVE'} />
    },
    {
      header: '',
      cell: (item) => (
        <div className="flex justify-end">
          <button 
            onClick={() => handleEdit(item)}
            className="p-2 text-gray-400 hover:text-[#0066CC] hover:bg-[#0066CC]/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Marcas</h2>
          <p className="text-[15px] text-[#86868B]">Gestión de marcas de refacciones</p>
        </div>
        
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0055FF] transition-colors text-[14px] font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva Marca
        </button>
      </div>

      <Table 
        data={data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.length}
        emptyTitle="No hay marcas"
        emptyMessage="Aún no se han registrado marcas en el sistema."
      />

      <BrandFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brand={selectedBrand}
      />
    </div>
  );
};
