import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '../services/config.service';
import { configKeys } from '../../../utils/queryKeys';

export const useUnits = () => {
  return useQuery({
    queryKey: configKeys.units(),
    queryFn: configService.getUnits,
  });
};

export const useSaveUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configService.saveUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.units() });
    },
  });
};

export const useDeleteUnit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configService.deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.units() });
    },
  });
};

export const usePriceLists = () => {
  return useQuery({
    queryKey: configKeys.priceLists(),
    queryFn: configService.getPriceLists,
  });
};

export const useSavePriceList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configService.savePriceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.priceLists() });
    },
  });
};

export const useDeletePriceList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configService.deletePriceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.priceLists() });
    },
  });
};

export const useAttributes = () => {
  return useQuery({
    queryKey: configKeys.attributes(),
    queryFn: configService.getAttributes,
  });
};

export const useSaveAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configService.saveAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.attributes() });
    },
  });
};

export const useDeleteAttribute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configService.deleteAttribute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.attributes() });
    },
  });
};
