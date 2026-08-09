import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useCatalog';
import { catalogService } from '../services/catalog.service';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Search, Plus, PackageSearch } from 'lucide-react';
import { LoadingState } from '../../../components/ui/LoadingState';

export const ProductsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useProducts({ page: 1, pageSize: 25, search });

  const products = data?.data || [];

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

      {isLoading ? (
        <LoadingState message="Cargando catálogo..." />
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200/60 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <PackageSearch className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-1">No hay productos</h3>
          <p className="text-[14px] text-[#86868B]">No se encontraron productos con los filtros actuales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((item: any) => {
            const imageUrl = catalogService.getProductImageUrl(item.image_url);

            return (
              <div 
                key={item.id}
                onClick={() => navigate(`/catalog/products/${item.id}`)}
                className="group bg-white border border-gray-200/60 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image Section */}
                <div className="relative aspect-square bg-[#F5F5F7] p-6 flex items-center justify-center overflow-hidden">
                  {item.is_new && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="text-[11px] bg-[#0066CC]/10 text-[#0066CC] font-semibold px-2.5 py-1 rounded-full uppercase backdrop-blur-md">
                        Nuevo
                      </span>
                    </div>
                  )}
                  
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <PackageSearch className="w-16 h-16 text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                  )}
                </div>

                {/* Info Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[12px] font-medium text-[#0066CC] truncate">
                      {item.code}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  
                  <h3 className="text-[15px] font-semibold text-[#1D1D1F] leading-tight mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  
                  <div className="mt-auto pt-3">
                    <div className="flex flex-col gap-1 text-[13px] text-[#86868B]">
                      {item.brand && (
                        <span className="truncate">Marca: <span className="font-medium text-[#1D1D1F]">{item.brand}</span></span>
                      )}
                      {item.category && (
                        <span className="truncate">Categoría: <span className="font-medium text-[#1D1D1F]">{item.category}</span></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
