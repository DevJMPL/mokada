import { supabase } from '../../../lib/supabase/client';

export const configService = {
  async getUnits() {
    const { data, error } = await supabase.from('units_of_measure').select('*').order('code');
    if (error) throw error;
    return data;
  },

  async getPriceLists() {
    const { data, error } = await supabase.from('price_lists').select('*').order('code');
    if (error) throw error;
    return data;
  },

  async getAttributes() {
    const { data, error } = await supabase.from('attribute_definitions').select('*').order('name');
    if (error) throw error;
    return data;
  }
};
