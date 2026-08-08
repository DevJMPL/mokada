import { useQuery } from '@tanstack/react-query';
import { configService } from '../services/config.service';
import { configKeys } from '../../../utils/queryKeys';

export const useUnits = () => {
  return useQuery({
    queryKey: configKeys.units(),
    queryFn: configService.getUnits,
  });
};

export const usePriceLists = () => {
  return useQuery({
    queryKey: configKeys.priceLists(),
    queryFn: configService.getPriceLists,
  });
};

export const useAttributes = () => {
  return useQuery({
    queryKey: configKeys.attributes(),
    queryFn: configService.getAttributes,
  });
};
