import { useState } from 'react';
import { useProducts } from '../hooks/useCatalog';
import { Table, type Column } from '../../../components/ui/Table';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Search } from 'lucide-react';
import { ProductDetailDrawer } from '../components/ProductDetailDrawer';

export const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { data, isLoading } = useProducts({ page: 1, pageSize: 25, search });

  const columns: Column<any>[] = [
    { 
      header: 'Código', 
      cell: (item) => (
        <button 
          onClick={() => setSelectedProductId(item.id)}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
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
      cell: (item) => item.is_new ? <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">Nuevo</span> : null
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Productos</h2>
          <p className="text-slate-500">Catálogo general de refacciones</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por código o nombre..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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

      <ProductDetailDrawer 
        productId={selectedProductId}
        isOpen={selectedProductId !== null}
        onClose={() => setSelectedProductId(null)}
      />
    </div>
  );
};
