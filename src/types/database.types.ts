export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attribute_definitions: {
        Row: {
          code: string
          created_at: string
          data_type: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          data_type: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_import_items: {
        Row: {
          catalog_import_id: string
          created_at: string
          error_message: string | null
          id: string
          normalized_data: Json | null
          product_id: string | null
          row_number: number | null
          source_data: Json | null
          status: Database["public"]["Enums"]["catalog_import_item_status"]
        }
        Insert: {
          catalog_import_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          normalized_data?: Json | null
          product_id?: string | null
          row_number?: number | null
          source_data?: Json | null
          status?: Database["public"]["Enums"]["catalog_import_item_status"]
        }
        Update: {
          catalog_import_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          normalized_data?: Json | null
          product_id?: string | null
          row_number?: number | null
          source_data?: Json | null
          status?: Database["public"]["Enums"]["catalog_import_item_status"]
        }
        Relationships: [
          {
            foreignKeyName: "catalog_import_items_catalog_import_id_fkey"
            columns: ["catalog_import_id"]
            isOneToOne: false
            referencedRelation: "catalog_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_import_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_import_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "catalog_import_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_imports: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_records: number
          file_name: string | null
          id: string
          processed_records: number
          source: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["catalog_import_status"]
          success_records: number
          total_records: number
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_records?: number
          file_name?: string | null
          id?: string
          processed_records?: number
          source?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["catalog_import_status"]
          success_records?: number
          total_records?: number
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_records?: number
          file_name?: string | null
          id?: string
          processed_records?: number
          source?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["catalog_import_status"]
          success_records?: number
          total_records?: number
          updated_at?: string
        }
        Relationships: []
      }
      catalog_staging: {
        Row: {
          confidence: string | null
          created_at: string | null
          detected_is_new: boolean | null
          detected_is_out_of_stock: boolean | null
          error_message: string | null
          id: string
          import_id: string | null
          normalized_brand: string | null
          normalized_category: string | null
          normalized_code: string | null
          normalized_data: Json | null
          raw_brand: string | null
          raw_category: string | null
          raw_code: string | null
          raw_description: string | null
          raw_price_discount_10: number | null
          raw_price_discount_20: number | null
          raw_price_public: number | null
          source_page: number | null
          status: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          detected_is_new?: boolean | null
          detected_is_out_of_stock?: boolean | null
          error_message?: string | null
          id?: string
          import_id?: string | null
          normalized_brand?: string | null
          normalized_category?: string | null
          normalized_code?: string | null
          normalized_data?: Json | null
          raw_brand?: string | null
          raw_category?: string | null
          raw_code?: string | null
          raw_description?: string | null
          raw_price_discount_10?: number | null
          raw_price_discount_20?: number | null
          raw_price_public?: number | null
          source_page?: number | null
          status?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          detected_is_new?: boolean | null
          detected_is_out_of_stock?: boolean | null
          error_message?: string | null
          id?: string
          import_id?: string | null
          normalized_brand?: string | null
          normalized_category?: string | null
          normalized_code?: string | null
          normalized_data?: Json | null
          raw_brand?: string | null
          raw_category?: string | null
          raw_code?: string | null
          raw_description?: string | null
          raw_price_discount_10?: number | null
          raw_price_discount_20?: number | null
          raw_price_public?: number | null
          source_page?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_staging_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "catalog_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          location_id: string | null
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          total_cost: number | null
          unit_cost: number | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          location_id?: string | null
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "warehouse_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          location_id: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          location_id?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "warehouse_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfer_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "inventory_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transfers: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          destination_warehouse_id: string
          id: string
          notes: string | null
          source_warehouse_id: string
          status: string
          transfer_number: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          destination_warehouse_id: string
          id?: string
          notes?: string | null
          source_warehouse_id: string
          status?: string
          transfer_number: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          destination_warehouse_id?: string
          id?: string
          notes?: string | null
          source_warehouse_id?: string
          status?: string
          transfer_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transfers_destination_warehouse_id_fkey"
            columns: ["destination_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transfers_source_warehouse_id_fkey"
            columns: ["source_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          code: string
          created_at: string
          currency: string
          discount_percentage: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_attributes: {
        Row: {
          attribute_id: string
          created_at: string
          id: string
          product_id: string
          updated_at: string
          value: Json
        }
        Insert: {
          attribute_id: string
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
          value: Json
        }
        Update: {
          attribute_id?: string
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "attribute_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_brands: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_fitments: {
        Row: {
          created_at: string
          engine: string | null
          has_abs: boolean | null
          id: string
          notes: string | null
          position: string | null
          product_id: string
          side: string | null
          transmission: string | null
          updated_at: string
          vehicle_model_id: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          created_at?: string
          engine?: string | null
          has_abs?: boolean | null
          id?: string
          notes?: string | null
          position?: string | null
          product_id: string
          side?: string | null
          transmission?: string | null
          updated_at?: string
          vehicle_model_id: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          created_at?: string
          engine?: string | null
          has_abs?: boolean | null
          id?: string
          notes?: string | null
          position?: string | null
          product_id?: string
          side?: string | null
          transmission?: string | null
          updated_at?: string
          vehicle_model_id?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_fitments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_fitments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_fitments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_fitments_vehicle_model_id_fkey"
            columns: ["vehicle_model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          id: string
          location_id: string | null
          maximum_stock: number | null
          minimum_stock: number
          product_id: string
          quantity: number
          reorder_point: number | null
          reserved_quantity: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          id?: string
          location_id?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          product_id: string
          quantity?: number
          reorder_point?: number | null
          reserved_quantity?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          id?: string
          location_id?: string | null
          maximum_stock?: number | null
          minimum_stock?: number
          product_id?: string
          quantity?: number
          reorder_point?: number | null
          reserved_quantity?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "warehouse_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          amount: number
          created_at: string
          id: string
          price_list_id: string
          product_id: string
          updated_at: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          price_list_id: string
          product_id: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          price_list_id?: string
          product_id?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_references: {
        Row: {
          brand_id: string | null
          created_at: string
          id: string
          notes: string | null
          product_id: string
          reference: string
          reference_type: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          reference: string
          reference_type?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          reference?: string
          reference_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_references_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_references_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_references_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_references_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_suppliers: {
        Row: {
          created_at: string
          id: string
          is_preferred: boolean
          last_cost: number | null
          lead_time_days: number | null
          minimum_order_quantity: number | null
          product_id: string
          supplier_code: string | null
          supplier_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_preferred?: boolean
          last_cost?: number | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          product_id: string
          supplier_code?: string | null
          supplier_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_preferred?: boolean
          last_cost?: number | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          product_id?: string
          supplier_code?: string | null
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand_id: string | null
          category_id: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_new: boolean
          name: string | null
          raw_description: string | null
          status: Database["public"]["Enums"]["product_status"]
          unit_of_measure_id: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          brand_id?: string | null
          category_id?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_new?: boolean
          name?: string | null
          raw_description?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          brand_id?: string | null
          category_id?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_new?: boolean
          name?: string | null
          raw_description?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          unit_of_measure_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "product_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_unit_of_measure_id_fkey"
            columns: ["unit_of_measure_id"]
            isOneToOne: false
            referencedRelation: "units_of_measure"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number
          unit_cost: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          expected_at: string | null
          id: string
          notes: string | null
          order_number: string
          ordered_at: string | null
          received_at: string | null
          status: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id: string
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          ordered_at?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id: string
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          ordered_at?: string | null
          received_at?: string | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          supplier_id?: string
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          legal_name: string | null
          name: string
          notes: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      units_of_measure: {
        Row: {
          allows_decimals: boolean
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          allows_decimals?: boolean
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          allows_decimals?: boolean
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          agent_functions: Database["public"]["Enums"]["agent_function_type"][]
          auth_user_id: string
          avatar_path: string | null
          created_at: string
          created_by: string | null
          email: string
          first_name: string
          id: string
          identity_document_path: string | null
          is_active: boolean
          last_name: string
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_profile_type"]
        }
        Insert: {
          agent_functions?: Database["public"]["Enums"]["agent_function_type"][]
          auth_user_id: string
          avatar_path?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          first_name: string
          id?: string
          identity_document_path?: string | null
          is_active?: boolean
          last_name: string
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_profile_type"]
        }
        Update: {
          agent_functions?: Database["public"]["Enums"]["agent_function_type"][]
          auth_user_id?: string
          avatar_path?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          first_name?: string
          id?: string
          identity_document_path?: string | null
          is_active?: boolean
          last_name?: string
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_profile_type"]
        }
        Relationships: []
      }
      vehicle_makes: {
        Row: {
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          created_at: string
          generation: string | null
          id: string
          is_active: boolean
          make_id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          generation?: string | null
          id?: string
          is_active?: boolean
          make_id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          generation?: string | null
          id?: string
          is_active?: boolean
          make_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_models_make_id_fkey"
            columns: ["make_id"]
            isOneToOne: false
            referencedRelation: "vehicle_makes"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_locations: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "warehouse_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_locations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      current_product_prices: {
        Row: {
          amount: number | null
          currency: string | null
          discount_percentage: number | null
          id: string | null
          price_list_code: string | null
          price_list_id: string | null
          price_list_name: string | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          valid_from: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_available: {
        Row: {
          availability_status: string | null
          available_quantity: number | null
          id: string | null
          location_code: string | null
          location_id: string | null
          location_name: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          product_brand: string | null
          product_category: string | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          reorder_point: number | null
          reserved_quantity: number | null
          warehouse_code: string | null
          warehouse_id: string | null
          warehouse_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "warehouse_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      low_stock_products: {
        Row: {
          availability_status: string | null
          available_quantity: number | null
          id: string | null
          location_code: string | null
          location_id: string | null
          location_name: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          product_brand: string | null
          product_category: string | null
          product_code: string | null
          product_id: string | null
          product_name: string | null
          quantity: number | null
          reorder_point: number | null
          reserved_quantity: number | null
          warehouse_code: string | null
          warehouse_id: string | null
          warehouse_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "warehouse_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_search"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_search: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string | null
          code: string | null
          description: string | null
          id: string | null
          is_new: boolean | null
          name: string | null
          references: string[] | null
          status: Database["public"]["Enums"]["product_status"] | null
        }
        Relationships: []
      }
      product_stock_summary: {
        Row: {
          brand: string | null
          code: string | null
          name: string | null
          product_id: string | null
          total_available: number | null
          total_quantity: number | null
          total_reserved: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_user_is_active: { Args: never; Returns: boolean }
      current_user_is_admin: { Args: never; Returns: boolean }
      current_user_profile_id: { Args: never; Returns: string }
      update_current_user_avatar: {
        Args: { next_avatar_path: string }
        Returns: {
          agent_functions: Database["public"]["Enums"]["agent_function_type"][]
          auth_user_id: string
          avatar_path: string | null
          created_at: string
          created_by: string | null
          email: string
          first_name: string
          id: string
          identity_document_path: string | null
          is_active: boolean
          last_name: string
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_profile_type"]
        }
        SetofOptions: {
          from: "*"
          to: "user_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_current_user_profile: {
        Args: {
          next_avatar_path: string
          next_first_name: string
          next_identity_document_path: string
          next_last_name: string
          next_phone: string
        }
        Returns: {
          agent_functions: Database["public"]["Enums"]["agent_function_type"][]
          auth_user_id: string
          avatar_path: string | null
          created_at: string
          created_by: string | null
          email: string
          first_name: string
          id: string
          identity_document_path: string | null
          is_active: boolean
          last_name: string
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_profile_type"]
        }
        SetofOptions: {
          from: "*"
          to: "user_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      agent_function_type: "DRIVER" | "SALESPERSON" | "WAREHOUSE"
      catalog_import_item_status: "PENDING" | "PROCESSED" | "SKIPPED" | "ERROR"
      catalog_import_status:
        | "PENDING"
        | "PROCESSING"
        | "COMPLETED"
        | "COMPLETED_WITH_ERRORS"
        | "FAILED"
      inventory_movement_type:
        | "PURCHASE"
        | "SALE"
        | "RETURN_IN"
        | "RETURN_OUT"
        | "TRANSFER_IN"
        | "TRANSFER_OUT"
        | "ADJUSTMENT_IN"
        | "ADJUSTMENT_OUT"
        | "INITIAL_STOCK"
      product_status: "ACTIVE" | "INACTIVE" | "DISCONTINUED"
      purchase_order_status:
        | "DRAFT"
        | "ORDERED"
        | "PARTIALLY_RECEIVED"
        | "RECEIVED"
        | "CANCELLED"
      reservation_status: "ACTIVE" | "CONSUMED" | "RELEASED" | "EXPIRED"
      user_profile_type: "CUSTOMER" | "AGENT" | "ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agent_function_type: ["DRIVER", "SALESPERSON", "WAREHOUSE"],
      catalog_import_item_status: ["PENDING", "PROCESSED", "SKIPPED", "ERROR"],
      catalog_import_status: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "COMPLETED_WITH_ERRORS",
        "FAILED",
      ],
      inventory_movement_type: [
        "PURCHASE",
        "SALE",
        "RETURN_IN",
        "RETURN_OUT",
        "TRANSFER_IN",
        "TRANSFER_OUT",
        "ADJUSTMENT_IN",
        "ADJUSTMENT_OUT",
        "INITIAL_STOCK",
      ],
      product_status: ["ACTIVE", "INACTIVE", "DISCONTINUED"],
      purchase_order_status: [
        "DRAFT",
        "ORDERED",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "CANCELLED",
      ],
      reservation_status: ["ACTIVE", "CONSUMED", "RELEASED", "EXPIRED"],
      user_profile_type: ["CUSTOMER", "AGENT", "ADMIN"],
    },
  },
} as const


