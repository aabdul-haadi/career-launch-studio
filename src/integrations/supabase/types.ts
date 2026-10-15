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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          certifications: Json | null
          coursework: Json | null
          created_at: string
          degree: string
          email: string
          experience: Json | null
          full_name: string
          fyp_methods: string | null
          fyp_objectives: string | null
          fyp_outcomes: string | null
          fyp_supervisor: string | null
          fyp_title: string | null
          fyp_tools: string | null
          generated_outputs: Json | null
          gpa: string | null
          graduation_year: string | null
          id: string
          job_description: string | null
          languages: Json | null
          linkedin_url: string | null
          nationality: string | null
          phone: string | null
          processed_at: string | null
          reference_code: string
          selected_roles: Json | null
          share_expires_at: string | null
          shared_at: string | null
          shared_documents: Json | null
          soft_skills: Json | null
          status: Database["public"]["Enums"]["submission_status"]
          technical_skills: Json | null
          university: string
          updated_at: string
        }
        Insert: {
          certifications?: Json | null
          coursework?: Json | null
          created_at?: string
          degree: string
          email: string
          experience?: Json | null
          full_name: string
          fyp_methods?: string | null
          fyp_objectives?: string | null
          fyp_outcomes?: string | null
          fyp_supervisor?: string | null
          fyp_title?: string | null
          fyp_tools?: string | null
          generated_outputs?: Json | null
          gpa?: string | null
          graduation_year?: string | null
          id?: string
          job_description?: string | null
          languages?: Json | null
          linkedin_url?: string | null
          nationality?: string | null
          phone?: string | null
          processed_at?: string | null
          reference_code?: string
          selected_roles?: Json | null
          share_expires_at?: string | null
          shared_at?: string | null
          shared_documents?: Json | null
          soft_skills?: Json | null
          status?: Database["public"]["Enums"]["submission_status"]
          technical_skills?: Json | null
          university: string
          updated_at?: string
        }
        Update: {
          certifications?: Json | null
          coursework?: Json | null
          created_at?: string
          degree?: string
          email?: string
          experience?: Json | null
          full_name?: string
          fyp_methods?: string | null
          fyp_objectives?: string | null
          fyp_outcomes?: string | null
          fyp_supervisor?: string | null
          fyp_title?: string | null
          fyp_tools?: string | null
          generated_outputs?: Json | null
          gpa?: string | null
          graduation_year?: string | null
          id?: string
          job_description?: string | null
          languages?: Json | null
          linkedin_url?: string | null
          nationality?: string | null
          phone?: string | null
          processed_at?: string | null
          reference_code?: string
          selected_roles?: Json | null
          share_expires_at?: string | null
          shared_at?: string | null
          shared_documents?: Json | null
          soft_skills?: Json | null
          status?: Database["public"]["Enums"]["submission_status"]
          technical_skills?: Json | null
          university?: string
          updated_at?: string
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
      submission_status: "pending" | "in_review" | "processing" | "completed"
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
      submission_status: ["pending", "in_review", "processing", "completed"],
    },
  },
} as const
