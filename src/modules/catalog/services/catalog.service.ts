import { supabase } from '../../../lib/supabase/client';

export const catalogService = {
  async getProducts({ page = 1, pageSize = 25, search = '' }) {
    let query = supabase.from('product_search').select('*', { count: 'exact' });
    
    if (search) {
      query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%,barcode.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query.range(from, to);
    if (error) throw error;
    
    return { data, count };
  },

  async getBrands() {
    const { data, error } = await supabase.from('product_brands').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async getCategories() {
    const { data, error } = await supabase.from('product_categories').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async getVehicles() {
    const { data, error } = await supabase.from('vehicle_models').select('*, vehicle_makes(name)').order('name');
    if (error) throw error;
    return data;
  }
};
