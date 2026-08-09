import { supabase } from '../../../lib/supabase/client';
import { storageService } from '../../../lib/supabase/storage';

export const fleetService = {
  async getVehicles() {
    const { data, error } = await supabase
      .from('fleet_vehicles')
      .select('*')
      .order('internal_code');
    if (error) throw error;
    return data;
  },

  async getVehicle(id: string) {
    const { data, error } = await supabase
      .from('fleet_vehicles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async saveVehicle(payload: any) {
    const { id, ...dataToSave } = payload;
    let request;
    if (id) {
      request = supabase.from('fleet_vehicles').update({ ...dataToSave, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      request = supabase.from('fleet_vehicles').insert([dataToSave]);
    }
    const { data, error } = await request.select().single();
    if (error) throw error;
    return data;
  },

  async deleteVehicle(id: string) {
    const { error } = await supabase.from('fleet_vehicles').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadVehicleImage(vehicleId: string, file: File) {
    return storageService.uploadFile({
      bucket: 'fleet-vehicles',
      file,
      ownerId: vehicleId,
      folder: 'images',
      upsert: true,
    });
  },

  getVehicleImageUrl(path: string | null) {
    if (!path) return null;
    return storageService.getPublicUrl('fleet-vehicles', path);
  },
};
