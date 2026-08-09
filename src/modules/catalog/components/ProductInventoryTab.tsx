import { useFieldArray, useFormContext } from 'react-hook-form';

interface Props {
  warehouses: any[];
}

export const ProductInventoryTab = ({ warehouses }: Props) => {
  const { control, register } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: 'inventory',
    keyName: '_local_id'
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-1">Topes de Inventario</h3>
        <p className="text-[14px] text-[#86868B] mb-6">Define el stock mínimo y máximo permitido por almacén para las alertas de reabastecimiento. La cantidad inicial se carga vía Movimientos de Inventario.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200/60 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200/60">
          <thead className="bg-[#F5F5F7]">
            <tr>
              <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider">Almacén</th>
              <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider w-40">Mínimo</th>
              <th className="px-6 py-3 text-left text-[12px] font-semibold text-[#86868B] uppercase tracking-wider w-40">Máximo</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200/60">
            {fields.map((field: any, index) => {
              const whName = warehouses.find(w => w.id === field.warehouse_id)?.name || 'Almacén';
              return (
                <tr key={field._local_id} className="hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#1D1D1F]">
                    {whName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="hidden" {...register(`inventory.${index}.warehouse_id`)} />
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      {...register(`inventory.${index}.minimum_stock`, { valueAsNumber: true })}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px] transition-all"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      {...register(`inventory.${index}.maximum_stock`, { valueAsNumber: true })}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20 focus:border-[#0066CC] text-[14px] transition-all"
                      placeholder="Ilimitado"
                    />
                  </td>
                </tr>
              );
            })}
            {fields.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[#86868B] text-[14px]">
                  No hay almacenes configurados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
