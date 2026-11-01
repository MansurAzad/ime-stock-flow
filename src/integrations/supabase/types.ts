export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          received_by: string | null
          salesman_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          received_by?: string | null
          salesman_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          received_by?: string | null
          salesman_id?: string
        }
        Relationships: []
      }
      imei_units: {
        Row: {
          created_at: string
          id: string
          imei: string
          product_id: string
          retailer_id: string | null
          salesman_id: string | null
          status: Database["public"]["Enums"]["imei_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          imei: string
          product_id: string
          retailer_id?: string | null
          salesman_id?: string | null
          status?: Database["public"]["Enums"]["imei_status"]
        }
        Update: {
          created_at?: string
          id?: string
          imei?: string
          product_id?: string
          retailer_id?: string | null
          salesman_id?: string | null
          status?: Database["public"]["Enums"]["imei_status"]
        }
        Relationships: [
          {
            foreignKeyName: "imei_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          is_smartphone: boolean
          low_stock_threshold: number
          model: string | null
          name: string
          price: number
          stock_qty: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_smartphone?: boolean
          low_stock_threshold?: number
          model?: string | null
          name: string
          price?: number
          stock_qty?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_smartphone?: boolean
          low_stock_threshold?: number
          model?: string | null
          name?: string
          price?: number
          stock_qty?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      retailer_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          retailer_id: string
          salesman_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          retailer_id: string
          salesman_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          retailer_id?: string
          salesman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_payments_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          salesman_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          salesman_id?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          salesman_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          id: string
          paid: number
          retailer_id: string
          salesman_id: string
          total: number
        }
        Insert: {
          created_at?: string
          id?: string
          paid?: number
          retailer_id: string
          salesman_id: string
          total?: number
        }
        Update: {
          created_at?: string
          id?: string
          paid?: number
          retailer_id?: string
          salesman_id?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          imei: string | null
          kind: Database["public"]["Enums"]["move_kind"]
          product_id: string
          qty: number
          retailer_id: string | null
          sale_id: string | null
          salesman_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          imei?: string | null
          kind: Database["public"]["Enums"]["move_kind"]
          product_id: string
          qty: number
          retailer_id?: string | null
          sale_id?: string | null
          salesman_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          imei?: string | null
          kind?: Database["public"]["Enums"]["move_kind"]
          product_id?: string
          qty?: number
          retailer_id?: string | null
          sale_id?: string | null
          salesman_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_imei: {
        Args: { _imei: string; _mode: string; _salesman: string }
        Returns: Json
      }
      distribution_dashboard: { Args: never; Returns: Json }
      distribution_insights: { Args: never; Returns: Json }
      distribution_stock_counts: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      holding_qty: {
        Args: { _product: string; _salesman: string }
        Returns: number
      }
      issue_stock: {
        Args: { _items: Json; _salesman: string }
        Returns: undefined
      }
      record_sale: {
        Args: { _items: Json; _paid: number; _retailer: string }
        Returns: string
      }
      return_stock: {
        Args: { _items: Json; _salesman: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "salesman"
      imei_status: "in_stock" | "with_salesman" | "sold" | "damaged"
      move_kind: "issue" | "sale" | "return" | "damage"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "salesman"],
      imei_status: ["in_stock", "with_salesman", "sold", "damaged"],
      move_kind: ["issue", "sale", "return", "damage"],
    },
  },
} as const
