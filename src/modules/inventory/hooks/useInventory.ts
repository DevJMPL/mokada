import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import { inventoryKeys } from '../../../utils/queryKeys';

export const useStock = () => {
  return useQuery({
    queryKey: inventoryKeys.stock(),
    queryFn: inventoryService.getStock,
  });
};

export const useMovements = (warehouseId?: string) => {
  return useQuery({
    queryKey: ['inventory_movements', warehouseId],
    queryFn: () => inventoryService.getMovements(warehouseId),
  });
};

export const useWarehouses = () => {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: inventoryService.getWarehouses,
  });
};

export const useSaveWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.saveWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses() });
    },
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.createMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
    },
  });
};

export const useTransfers = () => {
  return useQuery({
    queryKey: ['inventory_transfers'],
    queryFn: inventoryService.getTransfers,
  });
};

export const useTransferFull = (id: string | null) => {
  return useQuery({
    queryKey: ['inventory_transfers', id],
    queryFn: () => inventoryService.getTransferFull(id!),
    enabled: !!id,
  });
};

export const useSaveTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers'] });
    },
  });
};

export const useCompleteTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.completeTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers'] });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
    },
  });
};
