import { useForm, Controller } from 'react-hook-form';
import { Modal } from '../../../components/ui/Modal';
import { SearchSelect } from '../../../components/ui/SearchSelect';
import { useCreateMovement, useWarehouses } from '../hooks/useInventory';
import { useProducts } from '../../catalog/hooks/useCatalog';
import { useEffect } from 'react';
import { Package } from 'lucide-react';
import { catalogService } from '../../catalog/services/catalog.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MovementFormModal = ({ isOpen, onClose }: Props) => {
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm();
  const { mutateAsync: createMovement, isPending } = useCreateMovement();
  
  const { data: warehouses } = useWarehouses();
  const { data: productsResult } = useProducts({ page: 1, pageSize: 1000 });
  const products = productsResult?.data || [];

  useEffect(() => {
    if (isOpen) {
      reset({
        product_id: '',
        warehouse_id: '',
        movement_type: 'ADJUSTMENT_IN',
        quantity: '',
        notes: ''
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: any) => {
    try {
      await createMovement({
        ...data,
        quantity: Number(data.quantity)
      });
      onClose();
    } catch (error) {
      console.error('Error creando movimiento:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Movimiento de Inventario"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-4">
          <Controller
            name="product_id"
            control={control}
            rules={{ required: 'El producto es obligatorio' }}
            render={({ field }) => {
              const selectedProduct = products.find((p: any) => p.id === field.value);
              const imageUrl = selectedProduct?.image_url ? catalogService.getProductImageUrl(selectedProduct.image_url) : null;

              return (
                <div>
                  {!field.value ? (
                    <SearchSelect
                      label="Producto *"
                      options={products.map((p: any) => ({
                        value: p.id,
                        label: `[${p.code}] ${p.name}`,
                        keywords: p.code
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Busca y selecciona un producto..."
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200/60 rounded-xl relative group">
                      <label className="block text-[13px] font-medium text-[#1D1D1F] mb-3">Producto Seleccionado</label>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 flex items-center justify-center shrink-0 bg-white border border-gray-200/60 rounded-lg overflow-hidden shadow-sm">
                          {imageUrl ? (
                            <img src={imageUrl} alt={selectedProduct?.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                          )}
                        </div>
                        <div className="flex-1 mt-0.5">
                          <span className="text-[12px] font-medium text-[#0066CC] block mb-0.5">
                            {selectedProduct?.code}
                          </span>
                          <h4 className="text-[14px] font-semibold text-[#1D1D1F] line-clamp-2 pr-4">
                            {selectedProduct?.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => field.onChange('')}
                            className="mt-2 text-[12px] text-[#0066CC] hover:underline font-medium"
                          >
                            Cambiar producto
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id.message?.toString()}</p>}
                </div>
              );
            }}
          />

          <Controller
            name="warehouse_id"
            control={control}
            rules={{ required: 'El almacén es obligatorio' }}
            render={({ field }) => (
              <div>
                <SearchSelect
                  label="Almacén *"
                  options={warehouses?.map((w: any) => ({
                    value: w.id,
                    label: w.name
                  })) || []}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Selecciona un almacén..."
                />
                {errors.warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.warehouse_id.message?.toString()}</p>}
              </div>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Tipo de Movimiento *</label>
            <select
              {...register('movement_type', { required: true })}
              className="w-full px-3 py-2 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px]"
            >
              <option value="INITIAL_STOCK">Stock Inicial (+)</option>
              <option value="ADJUSTMENT_IN">Ajuste de Entrada (+)</option>
              <option value="ADJUSTMENT_OUT">Ajuste de Salida (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Cantidad *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register('quantity', { required: 'La cantidad es obligatoria', min: 0.01 })}
              className="w-full px-3 py-2 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px]"
              placeholder="0.00"
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message?.toString()}</p>}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Notas / Referencia</label>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full px-3 py-2 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px] resize-none"
            placeholder="Motivo del ajuste..."
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#0066CC] rounded-lg hover:bg-[#0055FF] transition-colors disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : 'Aplicar Movimiento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
