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
      activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          audio_url: string | null
          coin_value: number
          description: string | null
          id: string
          parent_id: string
          photo_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["task_status"]
          student_id: string
          submitted_at: string
          task_template_id: string | null
          title: string
        }
        Insert: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          audio_url?: string | null
          coin_value?: number
          description?: string | null
          id?: string
          parent_id: string
          photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          student_id: string
          submitted_at?: string
          task_template_id?: string | null
          title: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          audio_url?: string | null
          coin_value?: number
          description?: string | null
          id?: string
          parent_id?: string
          photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          student_id?: string
          submitted_at?: string
          task_template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          category: string
          coin_reward: number | null
          color_tag: string | null
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          is_completed: boolean | null
          start_time: string | null
          student_id: string
          title: string
        }
        Insert: {
          category: string
          coin_reward?: number | null
          color_tag?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_completed?: boolean | null
          start_time?: string | null
          student_id: string
          title: string
        }
        Update: {
          category?: string
          coin_reward?: number | null
          color_tag?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_completed?: boolean | null
          start_time?: string | null
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_transactions: {
        Row: {
          activity_id: string | null
          amount: number
          created_at: string
          description: string
          id: string
          student_id: string
          transaction_type: Database["public"]["Enums"]["activity_type"]
        }
        Insert: {
          activity_id?: string | null
          amount: number
          created_at?: string
          description: string
          id?: string
          student_id: string
          transaction_type: Database["public"]["Enums"]["activity_type"]
        }
        Update: {
          activity_id?: string | null
          amount?: number
          created_at?: string
          description?: string
          id?: string
          student_id?: string
          transaction_type?: Database["public"]["Enums"]["activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_scores: {
        Row: {
          accuracy: number | null
          coins_earned: number
          game_type: string
          id: string
          played_at: string
          score: number
          student_id: string
          time_taken: number | null
        }
        Insert: {
          accuracy?: number | null
          coins_earned?: number
          game_type: string
          id?: string
          played_at?: string
          score: number
          student_id: string
          time_taken?: number | null
        }
        Update: {
          accuracy?: number | null
          coins_earned?: number
          game_type?: string
          id?: string
          played_at?: string
          score?: number
          student_id?: string
          time_taken?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          parent_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          parent_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          parent_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          coins_awarded: number | null
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          referee_id: string | null
          referral_code: string
          referrer_id: string
        }
        Insert: {
          coins_awarded?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          referee_id?: string | null
          referral_code: string
          referrer_id: string
        }
        Update: {
          coins_awarded?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          referee_id?: string | null
          referral_code?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          coin_cost: number
          created_at: string
          description: string | null
          id: string
          is_milestone: boolean | null
          is_redeemed: boolean | null
          milestone_coins: number | null
          parent_id: string
          redeemed_at: string | null
          student_id: string
          title: string
        }
        Insert: {
          coin_cost: number
          created_at?: string
          description?: string | null
          id?: string
          is_milestone?: boolean | null
          is_redeemed?: boolean | null
          milestone_coins?: number | null
          parent_id: string
          redeemed_at?: string | null
          student_id: string
          title: string
        }
        Update: {
          coin_cost?: number
          created_at?: string
          description?: string | null
          id?: string
          is_milestone?: boolean | null
          is_redeemed?: boolean | null
          milestone_coins?: number | null
          parent_id?: string
          redeemed_at?: string | null
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewards_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rewards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          age_max: number | null
          age_min: number | null
          category: string
          coin_value: number
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          parent_id: string | null
          title: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          category: string
          coin_value?: number
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          parent_id?: string | null
          title: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          category?: string
          coin_value?: number
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          parent_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type: "task" | "calendar" | "game" | "bonus" | "referral"
      task_status: "pending" | "approved" | "rejected"
      user_role: "parent" | "student"
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
    Enums: {
      activity_type: ["task", "calendar", "game", "bonus", "referral"],
      task_status: ["pending", "approved", "rejected"],
      user_role: ["parent", "student"],
    },
  },
} as const
