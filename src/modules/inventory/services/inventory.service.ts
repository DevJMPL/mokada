import { supabase } from '../../../lib/supabase/client';

export const inventoryService = {
  async getStock() {
    const { data, error } = await supabase.from('inventory_available').select('*');
    if (error) throw error;
    return data;
  },

  async getMovements() {
    const { data, error } = await supabase.from('inventory_movements').select('*, products(name, code), warehouses(name)').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return data;
  },

  async getWarehouses() {
    const { data, error } = await supabase.from('warehouses').select('*').order('name');
    if (error) throw error;
    return data;
  }
};
