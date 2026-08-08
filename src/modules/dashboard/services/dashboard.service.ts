import { supabase } from '../../../lib/supabase/client';

export const dashboardService = {
  async getStats() {
    const [products, brands, categories, warehouses, lowStock, outOfStock] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('product_brands').select('*', { count: 'exact', head: true }),
      supabase.from('product_categories').select('*', { count: 'exact', head: true }),
      supabase.from('warehouses').select('*', { count: 'exact', head: true }),
      supabase.from('inventory_available').select('*', { count: 'exact', head: true }).eq('availability_status', 'LOW_STOCK'),
      supabase.from('inventory_available').select('*', { count: 'exact', head: true }).eq('availability_status', 'OUT_OF_STOCK')
    ]);

    return {
      productsCount: products.count || 0,
      brandsCount: brands.count || 0,
      categoriesCount: categories.count || 0,
      warehousesCount: warehouses.count || 0,
      lowStockCount: lowStock.count || 0,
      outOfStockCount: outOfStock.count || 0,
    };
  }
};
