import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { useProductFull, useSaveProductFull, useBrands, useCategories, useUploadProductImage } from '../hooks/useCatalog';
import { useUnits, usePriceLists } from '../../configuration/hooks/useConfig';
import { useWarehouses } from '../../inventory/hooks/useInventory';
import { ProductGeneralTab } from '../components/ProductGeneralTab';
import { ProductPricesTab } from '../components/ProductPricesTab';
import { ProductInventoryTab } from '../components/ProductInventoryTab';
import { ProductFitmentsTab } from '../components/ProductFitmentsTab';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useBarcodeScanner } from '../../../utils/useBarcodeScanner';

export const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [activeTab, setActiveTab] = useState<'general' | 'prices' | 'inventory' | 'fitments'>('general');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Loaders for lookups
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();
  const { data: units } = useUnits();
  const { data: priceLists } = usePriceLists();
  const { data: warehouses } = useWarehouses();

  // Load product if editing
  const { data: fullProduct, isLoading: isLoadingProduct } = useProductFull(isEditing ? id! : null);
  const { mutateAsync: saveProduct, isPending: isSaving } = useSaveProductFull();
  const { mutateAsync: uploadImage } = useUploadProductImage();

  const methods = useForm<{
    id: string | null;
    code: string;
    barcode: string;
    name: string;
    description: string;
    brand_id: string;
    category_id: string;
    unit_of_measure_id: string;
    status: string;
    prices: { price_list_id: string; amount: number }[];
    inventory: { warehouse_id: string; minimum_stock: number; maximum_stock: number | null }[];
    fitments: { vehicle_model_id: string; year_from: number | null; year_to: number | null; engine: string; notes: string }[];
  }>({
    defaultValues: {
      id: null,
      code: '',
      barcode: '',
      name: '',
      description: '',
      brand_id: '',
      category_id: '',
      unit_of_measure_id: '',
      status: 'ACTIVE',
      prices: [],
      inventory: [],
      fitments: []
    }
  });

  // Effect to populate form when data loads
  useEffect(() => {
    if (fullProduct) {
      const p: any = fullProduct.product;
      methods.reset({
        id: p.id,
        code: p.code || '',
        barcode: p.barcode || '',
        name: p.name || '',
        description: p.description || '',
        brand_id: p.brand_id || '',
        category_id: p.category_id || '',
        unit_of_measure_id: p.unit_of_measure_id || '',
        status: p.status || 'ACTIVE',
        prices: (fullProduct.prices as any) || [],
        inventory: (fullProduct.inventory as any) || [],
        fitments: (fullProduct.fitments as any) || []
      });
      if (p.image_url) {
        import('../services/catalog.service').then(m => {
          setCurrentImageUrl(m.catalogService.getProductImageUrl(p.image_url));
        });
      }
    } else if (!isEditing && priceLists && warehouses) {
      // Initialize arrays for new products based on available lists
      methods.reset({
        ...methods.getValues(),
        prices: priceLists.map((pl: any) => ({ price_list_id: pl.id, amount: 0 })),
        inventory: warehouses.map((wh: any) => ({ warehouse_id: wh.id, minimum_stock: 0, maximum_stock: null })),
        fitments: []
      });
    }
  }, [fullProduct, priceLists, warehouses, isEditing]);

  // Soporte para Escáner de Código de Barras
  useBarcodeScanner({
    onScan: (barcode) => {
      methods.setValue('barcode', barcode, { shouldValidate: true, shouldDirty: true });
      setActiveTab('general'); // Cambiar a la pestaña general para que el usuario vea que se escaneó
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsUploading(true);
      const cleanData = {
        ...data,
        fitments: data.fitments.map((f: any) => ({
          ...f,
          year_from: f.year_from || null,
          year_to: f.year_to || null,
        }))
      };
      const productId = await saveProduct(cleanData);

      if (imageFile && productId) {
        const imagePath = await uploadImage({ productId, file: imageFile });
        // Optionally update the product with the new image_url
        await saveProduct({ ...cleanData, id: productId, image_url: imagePath });
      }

      navigate('/catalog/products');
    } catch (error) {
      console.error('Error saving product', error);
      alert('Hubo un error al guardar el producto');
    } finally {
      setIsUploading(false);
    }
  };

  if (isEditing && isLoadingProduct) return <LoadingState message="Cargando producto..." />;

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'prices', label: 'Precios' },
    { id: 'inventory', label: 'Inventario' },
    { id: 'fitments', label: 'Compatibilidad' },
  ] as const;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/catalog/products')}
              className="p-2 hover:bg-gray-200/50 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">
                {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <p className="text-[15px] text-[#86868B] mt-1">
                {isEditing ? 'Modifica los detalles, precios e inventario' : 'Registra un nuevo elemento en el catálogo'}
              </p>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving || isUploading}
            className="flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#005bb5] text-white px-5 py-2.5 rounded-xl text-[14px] font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {(isSaving || isUploading) ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </div>

        {/* Tab Navigation (Segmented Control Style) */}
        <div className="flex p-1 space-x-1 bg-gray-200/50 rounded-xl max-w-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#1D1D1F] shadow-sm'
                  : 'text-[#86868B] hover:text-[#1D1D1F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 md:p-8">
          {activeTab === 'general' && (
            <ProductGeneralTab 
              brands={brands || []} 
              categories={categories || []} 
              units={units || []} 
              imageFile={imageFile}
              setImageFile={setImageFile}
              currentImageUrl={currentImageUrl}
            />
          )}
          {activeTab === 'prices' && (
            <ProductPricesTab priceLists={priceLists || []} />
          )}
          {activeTab === 'inventory' && (
            <ProductInventoryTab warehouses={warehouses || []} />
          )}
          {activeTab === 'fitments' && (
            <ProductFitmentsTab />
          )}
        </div>
      </form>
    </FormProvider>
  );
};
