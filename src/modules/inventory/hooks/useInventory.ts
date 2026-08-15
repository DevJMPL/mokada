import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';
import { inventoryKeys } from '../../../utils/queryKeys';
import { supabase } from '../../../lib/supabase/client';

export const useStock = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('stock_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_inventory' },
        () => {
          queryClient.invalidateQueries({ queryKey: inventoryKeys.stock() });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: inventoryKeys.stock(),
    queryFn: inventoryService.getStock,
  });
};

export const useMovements = (warehouseId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.movements(warehouseId),
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

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => inventoryService.updateTransfer(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers', variables.id] });
    },
  });
};

export const useCancelTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.cancelTransfer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers', id] });
    },
  });
};

export const useCompleteTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inventoryService.completeTransfer,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_transfers', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory_available'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_movements'] });
    },
  });
};
