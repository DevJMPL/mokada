import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSaveTransfer, useWarehouses } from '../hooks/useInventory';
import { useProducts } from '../../catalog/hooks/useCatalog';
import { Plus, Trash2 } from 'lucide-react';
import { AlertModal } from '../../../components/ui/AlertModal';

export const TransferFormPage = () => {
  const navigate = useNavigate();
  const { mutateAsync: saveTransfer, isPending } = useSaveTransfer();
  const { data: warehouses } = useWarehouses();
  const { data: productsResult } = useProducts({ page: 1, pageSize: 1000 });
  const products = productsResult?.data || [];

  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'error' | 'success' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      transfer_number: `TR-${new Date().getTime().toString().slice(-6)}`,
      source_warehouse_id: '',
      destination_warehouse_id: '',
      notes: '',
      items: [{ product_id: '', quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const sourceWarehouseId = watch('source_warehouse_id');

  const onSubmit = async (data: any) => {
    try {
      if (data.source_warehouse_id === data.destination_warehouse_id) {
        setAlertModal({
          isOpen: true,
          title: 'Almacenes Inválidos',
          message: 'El almacén de origen y destino no pueden ser el mismo.',
          type: 'error'
        });
        return;
      }
      
      const cleanData = {
        ...data,
        items: data.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: Number(item.quantity)
        }))
      };
      
      await saveTransfer(cleanData);
      navigate('/inventory/transfers');
    } catch (error) {
      console.error('Error guardando traspaso:', error);
      setAlertModal({
        isOpen: true,
        title: 'Error',
        message: 'Ocurrió un error al guardar el traspaso.',
        type: 'error'
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Nuevo Traspaso</h2>
        <p className="text-[15px] text-[#86868B]">Mover inventario entre almacenes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Almacén Origen *</label>
              <select
                {...register('source_warehouse_id', { required: 'El origen es obligatorio' })}
                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-[14px] transition-all"
              >
                <option value="">Seleccionar origen</option>
                {warehouses?.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {errors.source_warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.source_warehouse_id.message?.toString()}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Almacén Destino *</label>
              <select
                {...register('destination_warehouse_id', { required: 'El destino es obligatorio' })}
                className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-[14px] transition-all"
              >
                <option value="">Seleccionar destino</option>
                {warehouses?.filter((w: any) => w.id !== sourceWarehouseId).map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              {errors.destination_warehouse_id && <p className="text-red-500 text-xs mt-1">{errors.destination_warehouse_id.message?.toString()}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1D1D1F] mb-1.5">Notas / Referencia</label>
            <input
              type="text"
              {...register('notes')}
              className="w-full px-3 py-2 bg-gray-50 border border-transparent rounded-lg focus:bg-white focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-[14px] transition-all"
              placeholder="Ej: Traspaso urgente para sucursal norte"
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[17px] font-semibold text-[#1D1D1F]">Productos a Transferir</h3>
              <button
                type="button"
                onClick={() => append({ product_id: '', quantity: 1 })}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#0066CC] bg-[#0066CC]/10 rounded-lg hover:bg-[#0066CC]/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Añadir Producto
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-xl relative group">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <label className="block text-[12px] font-medium text-[#86868B] mb-1">Producto *</label>
                      <select
                        {...register(`items.${index}.product_id`, { required: true })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-[14px] transition-all"
                      >
                        <option value="">Seleccionar producto</option>
                        {products.map((p: any) => (
                          <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[12px] font-medium text-[#86868B] mb-1">Cantidad *</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        {...register(`items.${index}.quantity`, { required: true, min: 0.01, valueAsNumber: true })}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:border-[#0066CC] focus:ring-1 focus:ring-[#0066CC] text-[14px] transition-all"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/inventory/transfers')}
              className="px-5 py-2.5 text-[14px] font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-[14px] font-medium text-white bg-[#0066CC] rounded-xl hover:bg-[#0055FF] transition-colors shadow-sm disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Crear Borrador'}
            </button>
          </div>
        </form>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};
