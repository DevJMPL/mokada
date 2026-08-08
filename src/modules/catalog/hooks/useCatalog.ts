import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalog.service';
import { catalogKeys } from '../../../utils/queryKeys';

export const useProducts = (filters: any) => {
  return useQuery({
    queryKey: catalogKeys.products(filters),
    queryFn: () => catalogService.getProducts(filters),
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: catalogService.getBrands,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: catalogService.getCategories,
  });
};

export const useVehicles = () => {
  return useQuery({
    queryKey: catalogKeys.vehicles(),
    queryFn: catalogService.getVehicles,
  });
};
