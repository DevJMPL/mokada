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
  },

  async saveUnit(payload: any) {
    const { id, ...dataToSave } = payload;
    let request;
    if (id) {
      request = supabase.from('units_of_measure').update(dataToSave).eq('id', id);
    } else {
      request = supabase.from('units_of_measure').insert([dataToSave]);
    }
    const { data, error } = await request.select().single();
    if (error) throw error;
    return data;
  },

  async deleteUnit(id: string) {
    const { error } = await supabase.from('units_of_measure').delete().eq('id', id);
    if (error) throw error;
  },

  async savePriceList(payload: any) {
    const { id, ...dataToSave } = payload;
    let request;
    if (id) {
      request = supabase.from('price_lists').update(dataToSave).eq('id', id);
    } else {
      request = supabase.from('price_lists').insert([dataToSave]);
    }
    const { data, error } = await request.select().single();
    if (error) throw error;
    return data;
  },

  async deletePriceList(id: string) {
    const { error } = await supabase.from('price_lists').delete().eq('id', id);
    if (error) throw error;
  },

  async saveAttribute(payload: any) {
    const { id, ...dataToSave } = payload;
    let request;
    if (id) {
      request = supabase.from('attribute_definitions').update(dataToSave).eq('id', id);
    } else {
      request = supabase.from('attribute_definitions').insert([dataToSave]);
    }
    const { data, error } = await request.select().single();
    if (error) throw error;
    return data;
  },

  async deleteAttribute(id: string) {
    const { error } = await supabase.from('attribute_definitions').delete().eq('id', id);
    if (error) throw error;
  }
};
