import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import { inventoryKeys } from '../../../utils/queryKeys';

export const useStock = () => {
  return useQuery({
    queryKey: inventoryKeys.stock(),
    queryFn: inventoryService.getStock,
  });
};

export const useMovements = () => {
  return useQuery({
    queryKey: inventoryKeys.movements(),
    queryFn: inventoryService.getMovements,
  });
};

export const useWarehouses = () => {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: inventoryService.getWarehouses,
  });
};
