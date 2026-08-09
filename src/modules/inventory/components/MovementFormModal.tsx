import { useForm } from 'react-hook-form';
import { Modal } from '../../../components/ui/Modal';
import { useCreateMovement, useWarehouses } from '../hooks/useInventory';
import { useProducts } from '../../catalog/hooks/useCatalog';
import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MovementFormModal = ({ isOpen, onClose }: Props) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
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
        
        <div>
          <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Producto *</label>
          <select
            {...register('product_id', { required: 'El producto es obligatorio' })}
            className="w-full px-3 py-2 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px]"
          >
            <option value="">Selecciona un producto</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
            ))}
          </select>
          {errors.product_id && <p className="text-red-500 text-xs mt-1">{errors.product_id.message?.toString()}</p>}
        </div>

        <div>
          <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Almacén *</label>
          <select
            {...register('warehouse_id', { required: 'El almacén es obligatorio' })}
            className="w-full px-3 py-2 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px]"
          >
            <option value="">Selecciona un almacén</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          {errors.warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.warehouse_id.message?.toString()}</p>}
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
