export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          banner_image: string | null
          created_at: string | null
          description: string | null
          id: string
          modified_at: string | null
          name: string
          short_description: string | null
          slug: string
          state_id: string | null
          thumbnail_image: string | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          modified_at?: string | null
          name: string
          short_description?: string | null
          slug: string
          state_id?: string | null
          thumbnail_image?: string | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          modified_at?: string | null
          name?: string
          short_description?: string | null
          slug?: string
          state_id?: string | null
          thumbnail_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_doctor_relations: {
        Row: {
          clinic_id: string
          created_at: string | null
          doctor_id: string
          id: string
          modified_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          doctor_id: string
          id?: string
          modified_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          doctor_id?: string
          id?: string
          modified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_doctor_relations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_doctor_relations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "clinic_doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_doctors: {
        Row: {
          bio: string | null
          created_at: string | null
          featured_video: string | null
          id: string
          image: string | null
          is_active: boolean | null
          is_featured: boolean | null
          modified_at: string | null
          name: string
          slug: string
          specialty: string | null
          status: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          featured_video?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          modified_at?: string | null
          name: string
          slug: string
          specialty?: string | null
          status?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          featured_video?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          modified_at?: string | null
          name?: string
          slug?: string
          specialty?: string | null
          status?: string | null
        }
        Relationships: []
      }
      clinic_hours: {
        Row: {
          clinic_id: string
          close_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          modified_at: string | null
          open_time: string | null
        }
        Insert: {
          clinic_id: string
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          modified_at?: string | null
          open_time?: string | null
        }
        Update: {
          clinic_id?: string
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          modified_at?: string | null
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_reviews: {
        Row: {
          author_name: string
          clinic_id: string
          created_at: string | null
          email: string | null
          id: string
          modified_at: string | null
          rating: number | null
          review_time: string | null
          source: string | null
          status: string | null
          text: string | null
        }
        Insert: {
          author_name: string
          clinic_id: string
          created_at?: string | null
          email?: string | null
          id?: string
          modified_at?: string | null
          rating?: number | null
          review_time?: string | null
          source?: string | null
          status?: string | null
          text?: string | null
        }
        Update: {
          author_name?: string
          clinic_id?: string
          created_at?: string | null
          email?: string | null
          id?: string
          modified_at?: string | null
          rating?: number | null
          review_time?: string | null
          source?: string | null
          status?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_reviews_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_service_relations: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          service_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          service_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_service_relations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_service_relations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "clinic_services"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          modified_at: string | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          modified_at?: string | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          modified_at?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      clinic_special_hours: {
        Row: {
          clinic_id: string
          close_time: string | null
          created_at: string | null
          date: string
          id: string
          is_closed: boolean | null
          modified_at: string | null
          open_time: string | null
        }
        Insert: {
          clinic_id: string
          close_time?: string | null
          created_at?: string | null
          date: string
          id?: string
          is_closed?: boolean | null
          modified_at?: string | null
          open_time?: string | null
        }
        Update: {
          clinic_id?: string
          close_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          is_closed?: boolean | null
          modified_at?: string | null
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_special_hours_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          area_id: string | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          featured_video: string | null
          id: string
          images: string[] | null
          instagram_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_permanently_closed: boolean | null
          latitude: number | null
          location: unknown | null
          longitude: number | null
          modified_at: string | null
          name: string
          neighborhood: string | null
          open_on_public_holidays: boolean | null
          phone: string | null
          place_id: string
          postal_code: string | null
          rating: number | null
          review_count: number | null
          slug: string
          source: string | null
          state_id: string | null
          status: string | null
          website: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          area_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          featured_video?: string | null
          id?: string
          images?: string[] | null
          instagram_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_permanently_closed?: boolean | null
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          modified_at?: string | null
          name: string
          neighborhood?: string | null
          open_on_public_holidays?: boolean | null
          phone?: string | null
          place_id: string
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          slug: string
          source?: string | null
          state_id?: string | null
          status?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          area_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          featured_video?: string | null
          id?: string
          images?: string[] | null
          instagram_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_permanently_closed?: boolean | null
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          modified_at?: string | null
          name?: string
          neighborhood?: string | null
          open_on_public_holidays?: boolean | null
          phone?: string | null
          place_id?: string
          postal_code?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          source?: string | null
          state_id?: string | null
          status?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          banner_image: string | null
          created_at: string | null
          description: string | null
          id: string
          modified_at: string | null
          name: string
          short_description: string | null
          slug: string
          thumbnail_image: string | null
        }
        Insert: {
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          modified_at?: string | null
          name: string
          short_description?: string | null
          slug: string
          thumbnail_image?: string | null
        }
        Update: {
          banner_image?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          modified_at?: string | null
          name?: string
          short_description?: string | null
          slug?: string
          thumbnail_image?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_clinic_hours: {
        Args: {
          p_clinic_id: string
          p_day_of_week: number
          p_open_time: string
          p_close_time: string
        }
        Returns: string
      }
      add_clinic_hours_batch: {
        Args: { p_clinic_id: string; p_hours: Json }
        Returns: string[]
      }
      approved_clinic: {
        Args: { to_be_reviewed_clinic_id_param: string }
        Returns: string
      }
      get_clinic_by_slug: {
        Args: { slug_input: string; status_input: string; review_limit: number }
        Returns: Json
      }
      get_nearby_clinics: {
        Args: {
          clinic_latitude: number
          clinic_longitude: number
          radius_km: number
          result_limit?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          latitude: number
          longitude: number
          distance_km: number
          area_id: string
          area_name: string
          area_slug: string
          state_id: string
          state_name: string
          state_slug: string
          images: string[]
          address: string
          neighborhood: string
          city: string
          postal_code: string
          phone: string
          rating: number
          open_on_public_holidays: boolean
          is_permanently_closed: boolean
          is_featured: boolean
          is_active: boolean
          status: string
          hours: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
