export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          code: string
          barcode: string | null
          brand_id: string
          category_id: string | null
          unit_of_measure_id: string
          name: string
          description: string | null
          raw_description: string | null
          status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'
          is_new: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: { /* omit for brevity */ }
        Update: { /* omit for brevity */ }
      }
      product_brands: {
        Row: {
          id: string
          code: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      product_categories: {
        Row: {
          id: string
          parent_id: string | null
          code: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      vehicle_makes: {
        Row: {
          id: string
          code: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      vehicle_models: {
        Row: {
          id: string
          make_id: string
          name: string
          generation: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      product_fitments: {
        Row: {
          id: string
          product_id: string
          vehicle_model_id: string
          year_from: number | null
          year_to: number | null
          engine: string | null
          transmission: string | null
          position: string | null
          side: string | null
          has_abs: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      warehouses: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          location_id: string | null
          movement_type: string
          quantity: number
          unit_cost: number | null
          total_cost: number | null
          reference_type: string | null
          reference_id: string | null
          reference_number: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
      }
      units_of_measure: {
        Row: {
          id: string
          code: string
          name: string
          allows_decimals: boolean
          created_at: string
        }
      }
      price_lists: {
        Row: {
          id: string
          code: string
          name: string
          discount_percentage: number
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      attribute_definitions: {
        Row: {
          id: string
          code: string
          name: string
          data_type: string
          unit: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
    }
    Views: {
      inventory_available: {
        Row: {
          product_id: string
          product_code: string
          product_name: string
          product_brand: string
          product_category: string | null
          warehouse: string
          location: string | null
          quantity: number
          reserved_quantity: number
          available_quantity: number
          minimum_stock: number | null
          maximum_stock: number | null
          reorder_point: number | null
          availability_status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK'
        }
      }
      product_stock_summary: {
        Row: {
          product_id: string
          code: string
          name: string
          brand: string
          total_quantity: number
          total_reserved: number
          total_available: number
        }
      }
      low_stock_products: {
        Row: {
          product_id: string
          code: string
          name: string
          brand: string
          available_quantity: number
          reorder_point: number
        }
      }
      current_product_prices: {
        Row: {
          product_id: string
          product_code: string
          product_name: string
          price_list_code: string
          price_list_name: string
          discount_percentage: number
          currency: string
          amount: number
          valid_from: string
        }
      }
      product_search: {
        Row: {
          id: string
          code: string
          barcode: string | null
          name: string
          description: string | null
          status: string
          is_new: boolean
          brand: string
          category: string | null
          references: string[] | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
