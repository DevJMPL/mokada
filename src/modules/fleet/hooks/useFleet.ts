import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fleetService } from '../services/fleet.service';
import { fleetKeys } from '../../../utils/queryKeys';

export const useFleetVehicles = () => {
  return useQuery({
    queryKey: fleetKeys.vehicles(),
    queryFn: fleetService.getVehicles,
  });
};

export const useFleetVehicle = (id: string | null) => {
  return useQuery({
    queryKey: fleetKeys.vehicle(id!),
    queryFn: () => fleetService.getVehicle(id!),
    enabled: !!id,
  });
};

export const useSaveFleetVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fleetService.saveVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles() });
    },
  });
};

export const useDeleteFleetVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fleetService.deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles() });
    },
  });
};

export const useUploadVehicleImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, file }: { vehicleId: string; file: File }) =>
      fleetService.uploadVehicleImage(vehicleId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetKeys.vehicles() });
    },
  });
};
