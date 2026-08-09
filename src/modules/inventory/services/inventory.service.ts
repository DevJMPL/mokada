import { supabase } from '../../../lib/supabase/client';

export const inventoryService = {
  async getStock() {
    const { data, error } = await supabase.from('inventory_available').select('*');
    if (error) throw error;
    return data;
  },

  async getMovements(warehouseId?: string) {
    let query = supabase.from('inventory_movements').select('*, products(name, code), warehouses(name)').order('created_at', { ascending: false }).limit(100);
    if (warehouseId) {
      query = query.eq('warehouse_id', warehouseId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getWarehouses() {
    const { data, error } = await supabase.from('warehouses').select('*').order('name');
    if (error) throw error;
    return data;
  },

  async saveWarehouse(payload: any) {
    const { id, ...dataToSave } = payload;
    let request;
    if (id) {
      request = (supabase as any).from('warehouses').update(dataToSave).eq('id', id);
    } else {
      request = (supabase as any).from('warehouses').insert([dataToSave]);
    }
    const { data, error } = await request.select().single();
    if (error) throw error;
    return data;
  },

  async createMovement(payload: {
    product_id: string;
    warehouse_id: string;
    movement_type: string;
    quantity: number;
    notes?: string;
  }) {
    const { data, error } = await (supabase.rpc as any)('process_inventory_movement', {
      p_product_id: payload.product_id,
      p_warehouse_id: payload.warehouse_id,
      p_movement_type: payload.movement_type,
      p_quantity: payload.quantity,
      p_notes: payload.notes || null
    });
    if (error) throw error;
    return data;
  },

  async getTransfers() {
    const { data, error } = await (supabase as any)
      .from('inventory_transfers')
      .select(`
        *,
        source:warehouses!source_warehouse_id(name),
        destination:warehouses!destination_warehouse_id(name),
        items:inventory_transfer_items(count)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getTransferFull(id: string) {
    const { data: transfer, error: transferError } = await (supabase as any)
      .from('inventory_transfers')
      .select(`
        *,
        source:warehouses!source_warehouse_id(name),
        destination:warehouses!destination_warehouse_id(name)
      `)
      .eq('id', id)
      .single();
    if (transferError) throw transferError;

    const { data: items, error: itemsError } = await (supabase as any)
      .from('inventory_transfer_items')
      .select('*, products(name, code)')
      .eq('transfer_id', id);
    if (itemsError) throw itemsError;

    return { ...transfer, items };
  },

  async createTransfer(payload: {
    transfer_number: string;
    source_warehouse_id: string;
    destination_warehouse_id: string;
    notes?: string;
    items: { product_id: string; quantity: number }[];
  }) {
    // We can do this with standard supabase queries since it doesn't affect stock yet
    const { items, ...transferData } = payload;
    
    const { data: transfer, error: transferError } = await (supabase as any)
      .from('inventory_transfers')
      .insert([transferData])
      .select()
      .single();
    
    if (transferError) throw transferError;

    const itemsToInsert = items.map(item => ({
      ...item,
      transfer_id: transfer.id
    }));

    const { error: itemsError } = await (supabase as any)
      .from('inventory_transfer_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return transfer;
  },

  async completeTransfer(transferId: string) {
    const { data, error } = await (supabase.rpc as any)('process_inventory_transfer', {
      p_transfer_id: transferId
    });
    if (error) throw error;
    return data;
  }
};
