import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useCatalog';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Search, Plus } from 'lucide-react';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts({ page: 1, pageSize: 25, search });

  const columns: Column<any>[] = [
    { 
      header: 'Código', 
      cell: (item) => (
        <button 
          onClick={() => navigate(`/catalog/products/${item.id}`)}
          className="font-medium text-[#0066CC] hover:underline text-left"
        >
          {item.code}
        </button>
      )
    },
    { header: 'Producto', accessorKey: 'name' },
    { header: 'Marca', accessorKey: 'brand' },
    { header: 'Categoría', accessorKey: 'category' },
    { 
      header: 'Estado', 
      cell: (item) => <StatusBadge status={item.status} />
    },
    { 
      header: 'Nuevo', 
      cell: (item) => item.is_new ? <span className="text-[11px] bg-[#0066CC]/10 text-[#0066CC] font-semibold px-2 py-0.5 rounded-full uppercase">Nuevo</span> : null
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Productos</h2>
          <p className="text-[15px] text-[#86868B] mt-1">Catálogo general de refacciones</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por código o nombre..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px] transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => navigate('/catalog/products/new')}
            className="flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#005bb5] text-white px-4 py-2 rounded-xl text-[14px] font-medium transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
        </div>
      </div>

      <Table 
        data={data?.data || []} 
        columns={columns}
        isLoading={isLoading}
        isEmpty={!data?.data?.length}
        emptyTitle="No hay productos"
        emptyMessage="No se encontraron productos con los filtros actuales."
      />
    </div>
  );
};
