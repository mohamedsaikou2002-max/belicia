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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      belicia_memory: {
        Row: {
          content: string
          created_at: string
          id: string
          importance: number
          inquiry_mode: string | null
          memory_type: string | null
          pemf_coherence_at_time: number | null
          role: string
          session_id: string | null
          summary: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          importance?: number
          inquiry_mode?: string | null
          memory_type?: string | null
          pemf_coherence_at_time?: number | null
          role: string
          session_id?: string | null
          summary?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          importance?: number
          inquiry_mode?: string | null
          memory_type?: string | null
          pemf_coherence_at_time?: number | null
          role?: string
          session_id?: string | null
          summary?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      belicia_profile: {
        Row: {
          active_missions: Json
          avg_session_length_mins: number
          baseline_hrv: number | null
          current_pemf_state: Json | null
          dhikr_preferences: Json
          display_name: string | null
          id: string
          key_relationships: Json
          language_register: string | null
          madhab: string | null
          name: string | null
          peak_focus_windows: Json
          pemf_enabled: boolean
          pemf_morning_protocol: string | null
          pemf_sleep_protocol: string | null
          prayer_location: Json | null
          preferences: Json
          preferred_inquiry_mode: string | null
          preferred_suggestion_density: string | null
          projects: Json
          push_subscription: Json | null
          response_depth: string | null
          spiritual_station: string | null
          strategic_context: string | null
          thought_patterns: Json
          timezone: string | null
          updated_at: string
          user_id: string
          voice_profile: string | null
        }
        Insert: {
          active_missions?: Json
          avg_session_length_mins?: number
          baseline_hrv?: number | null
          current_pemf_state?: Json | null
          dhikr_preferences?: Json
          display_name?: string | null
          id?: string
          key_relationships?: Json
          language_register?: string | null
          madhab?: string | null
          name?: string | null
          peak_focus_windows?: Json
          pemf_enabled?: boolean
          pemf_morning_protocol?: string | null
          pemf_sleep_protocol?: string | null
          prayer_location?: Json | null
          preferences?: Json
          preferred_inquiry_mode?: string | null
          preferred_suggestion_density?: string | null
          projects?: Json
          push_subscription?: Json | null
          response_depth?: string | null
          spiritual_station?: string | null
          strategic_context?: string | null
          thought_patterns?: Json
          timezone?: string | null
          updated_at?: string
          user_id?: string
          voice_profile?: string | null
        }
        Update: {
          active_missions?: Json
          avg_session_length_mins?: number
          baseline_hrv?: number | null
          current_pemf_state?: Json | null
          dhikr_preferences?: Json
          display_name?: string | null
          id?: string
          key_relationships?: Json
          language_register?: string | null
          madhab?: string | null
          name?: string | null
          peak_focus_windows?: Json
          pemf_enabled?: boolean
          pemf_morning_protocol?: string | null
          pemf_sleep_protocol?: string | null
          prayer_location?: Json | null
          preferences?: Json
          preferred_inquiry_mode?: string | null
          preferred_suggestion_density?: string | null
          projects?: Json
          push_subscription?: Json | null
          response_depth?: string | null
          spiritual_station?: string | null
          strategic_context?: string | null
          thought_patterns?: Json
          timezone?: string | null
          updated_at?: string
          user_id?: string
          voice_profile?: string | null
        }
        Relationships: []
      }
      home_commands: {
        Row: {
          command: Json
          executed_at: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          command?: Json
          executed_at?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Update: {
          command?: Json
          executed_at?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mirofish_sims: {
        Row: {
          created_at: string
          id: string
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pemf_readings: {
        Row: {
          ambient_field_delta: number | null
          coherence_score: number | null
          created_at: string
          dominant_frequency: number | null
          hrv_score: number | null
          id: string
          notes: string | null
          raw_data: Json | null
          recovery_state: string | null
          session_type: string | null
          stress_index: number | null
          timestamp: string
          user_id: string
        }
        Insert: {
          ambient_field_delta?: number | null
          coherence_score?: number | null
          created_at?: string
          dominant_frequency?: number | null
          hrv_score?: number | null
          id?: string
          notes?: string | null
          raw_data?: Json | null
          recovery_state?: string | null
          session_type?: string | null
          stress_index?: number | null
          timestamp?: string
          user_id?: string
        }
        Update: {
          ambient_field_delta?: number | null
          coherence_score?: number | null
          created_at?: string
          dominant_frequency?: number | null
          hrv_score?: number | null
          id?: string
          notes?: string | null
          raw_data?: Json | null
          recovery_state?: string | null
          session_type?: string | null
          stress_index?: number | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_briefs: {
        Row: {
          brief_type: string | null
          content: string | null
          created_at: string
          delivered_at: string | null
          delivery_channel: string | null
          id: string
          scheduled_for: string | null
          status: string
          user_id: string
        }
        Insert: {
          brief_type?: string | null
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_channel?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          user_id?: string
        }
        Update: {
          brief_type?: string | null
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_channel?: string | null
          id?: string
          scheduled_for?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
