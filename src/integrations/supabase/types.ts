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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      applications: {
        Row: {
          applicant_id: string
          applied_at: string
          cover_letter: string | null
          employer_notes: string | null
          id: string
          job_id: string
          resume_path: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_id: string
          applied_at?: string
          cover_letter?: string | null
          employer_notes?: string | null
          id?: string
          job_id: string
          resume_path?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          applied_at?: string
          cover_letter?: string | null
          employer_notes?: string | null
          id?: string
          job_id?: string
          resume_path?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip: string | null
          metadata: Json
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          user_agent?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_size: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          industry: string | null
          location: string | null
          logo_path: string | null
          name: string
          owner_id: string
          phone: string | null
          region: string | null
          slug: string
          updated_at: string
          verification_notes: string | null
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_path?: string | null
          name: string
          owner_id: string
          phone?: string | null
          region?: string | null
          slug: string
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_path?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          region?: string | null
          slug?: string
          updated_at?: string
          verification_notes?: string | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      external_jobs: {
        Row: {
          apply_url: string
          company: string | null
          currency: string | null
          dedupe_key: string
          description: string | null
          eligibility: string
          employment_type: string | null
          experience: string | null
          external_id: string
          id: string
          imported_at: string
          is_expired: boolean
          last_checked_at: string
          location: string | null
          logo_url: string | null
          pay_unit: string | null
          published_at: string | null
          salary_max: number | null
          salary_min: number | null
          search: unknown
          source_id: string
          source_url: string | null
          tags: string[]
          title: string
          workplace: string
        }
        Insert: {
          apply_url: string
          company?: string | null
          currency?: string | null
          dedupe_key: string
          description?: string | null
          eligibility?: string
          employment_type?: string | null
          experience?: string | null
          external_id: string
          id?: string
          imported_at?: string
          is_expired?: boolean
          last_checked_at?: string
          location?: string | null
          logo_url?: string | null
          pay_unit?: string | null
          published_at?: string | null
          salary_max?: number | null
          salary_min?: number | null
          search?: unknown
          source_id: string
          source_url?: string | null
          tags?: string[]
          title: string
          workplace?: string
        }
        Update: {
          apply_url?: string
          company?: string | null
          currency?: string | null
          dedupe_key?: string
          description?: string | null
          eligibility?: string
          employment_type?: string | null
          experience?: string | null
          external_id?: string
          id?: string
          imported_at?: string
          is_expired?: boolean
          last_checked_at?: string
          location?: string | null
          logo_url?: string | null
          pay_unit?: string | null
          published_at?: string | null
          salary_max?: number | null
          salary_min?: number | null
          search?: unknown
          source_id?: string
          source_url?: string | null
          tags?: string[]
          title?: string
          workplace?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "job_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          active: boolean
          created_at: string
          description_en: string | null
          description_sw: string | null
          icon: string | null
          id: string
          name_en: string
          name_sw: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description_en?: string | null
          description_sw?: string | null
          icon?: string | null
          id?: string
          name_en: string
          name_sw: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description_en?: string | null
          description_sw?: string | null
          icon?: string | null
          id?: string
          name_en?: string
          name_sw?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      job_skills: {
        Row: {
          id: string
          job_id: string
          skill: string
        }
        Insert: {
          id?: string
          job_id: string
          skill: string
        }
        Update: {
          id?: string
          job_id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_sources: {
        Row: {
          active_jobs: number
          created_at: string
          enabled: boolean
          id: string
          last_error: string | null
          last_run_at: string | null
          last_status: string
          last_success_at: string | null
          name: string
          terms_url: string | null
          website: string
        }
        Insert: {
          active_jobs?: number
          created_at?: string
          enabled?: boolean
          id: string
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string
          last_success_at?: string | null
          name: string
          terms_url?: string | null
          website: string
        }
        Update: {
          active_jobs?: number
          created_at?: string
          enabled?: boolean
          id?: string
          last_error?: string | null
          last_run_at?: string | null
          last_status?: string
          last_success_at?: string | null
          name?: string
          terms_url?: string | null
          website?: string
        }
        Relationships: []
      }
      job_sync_logs: {
        Row: {
          error: string | null
          expired: number
          fetched: number
          finished_at: string | null
          id: string
          inserted: number
          skipped_duplicates: number
          source_id: string
          started_at: string
          status: string
          updated: number
        }
        Insert: {
          error?: string | null
          expired?: number
          fetched?: number
          finished_at?: string | null
          id?: string
          inserted?: number
          skipped_duplicates?: number
          source_id: string
          started_at?: string
          status: string
          updated?: number
        }
        Update: {
          error?: string | null
          expired?: number
          fetched?: number
          finished_at?: string | null
          id?: string
          inserted?: number
          skipped_duplicates?: number
          source_id?: string
          started_at?: string
          status?: string
          updated?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_sync_logs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "job_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          applications_count: number
          category_id: string | null
          company_id: string
          created_at: string
          currency: string
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_level: Database["public"]["Enums"]["experience_level"]
          id: string
          is_remote: boolean
          location: string | null
          posted_by: string
          published_at: string | null
          region: string | null
          requirements: string | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          slug: string
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          application_deadline?: string | null
          applications_count?: number
          category_id?: string | null
          company_id: string
          created_at?: string
          currency?: string
          description: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_remote?: boolean
          location?: string | null
          posted_by: string
          published_at?: string | null
          region?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug: string
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          application_deadline?: string | null
          applications_count?: number
          category_id?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_level?: Database["public"]["Enums"]["experience_level"]
          id?: string
          is_remote?: boolean
          location?: string | null
          posted_by?: string
          published_at?: string | null
          region?: string | null
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          headline: string | null
          id: string
          location: string | null
          phone: string | null
          preferred_language: Database["public"]["Enums"]["language_code"]
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id: string
          location?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language_code"]
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          preferred_language?: Database["public"]["Enums"]["language_code"]
          updated_at?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          job_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          job_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          job_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_job_actions: {
        Row: {
          action: string
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
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
      can_manage_company: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      discover_jobs: { Args: { _filters?: Json }; Returns: Json }
      get_external_listing: {
        Args: { _id: string }
        Returns: {
          apply_url: string
          company: string
          currency: string
          description: string
          eligibility: string
          employment_type: string
          experience: string
          id: string
          imported_at: string
          is_expired: boolean
          last_checked_at: string
          location: string
          logo_url: string
          pay_unit: string
          published_at: string
          salary_max: number
          salary_min: number
          source_name: string
          source_url: string
          source_website: string
          tags: string[]
          title: string
          workplace: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      listings_base: {
        Args: never
        Returns: {
          apply_url: string
          category_slug: string
          company: string
          currency: string
          deadline: string
          description: string
          discovered_at: string
          eligibility: string
          employment_type: string
          experience: string
          kind: string
          listing_id: string
          location: string
          logo_url: string
          pay_unit: string
          published_at: string
          region: string
          salary_max: number
          salary_min: number
          search: unknown
          slug: string
          source_name: string
          source_url: string
          tags: string[]
          title: string
          workplace: string
        }[]
      }
      public_job_detail: { Args: { _slug: string }; Returns: Json }
      search_listings: {
        Args: {
          _category?: string
          _currency?: string
          _days?: number
          _eligibility?: string
          _employment_type?: string
          _experience?: string
          _kind?: string
          _limit?: number
          _min_salary?: number
          _offset?: number
          _pay_unit?: string
          _q?: string
          _region?: string
          _sort?: string
          _workplace?: string
        }
        Returns: {
          apply_url: string
          company: string
          currency: string
          deadline: string
          discovered_at: string
          eligibility: string
          employment_type: string
          experience: string
          kind: string
          listing_id: string
          location: string
          logo_url: string
          pay_unit: string
          published_at: string
          region: string
          salary_max: number
          salary_min: number
          slug: string
          source_name: string
          tags: string[]
          title: string
          total_count: number
          workplace: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "moderator"
        | "employer"
        | "recruiter"
        | "job_seeker"
        | "support"
      application_status:
        | "submitted"
        | "reviewing"
        | "shortlisted"
        | "interview"
        | "offered"
        | "hired"
        | "rejected"
        | "withdrawn"
      employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship"
        | "temporary"
        | "freelance"
      experience_level:
        | "entry"
        | "junior"
        | "mid"
        | "senior"
        | "lead"
        | "executive"
      job_status: "draft" | "published" | "closed" | "archived"
      language_code: "en" | "sw"
      verification_status: "pending" | "verified" | "rejected"
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
      app_role: [
        "super_admin",
        "admin",
        "moderator",
        "employer",
        "recruiter",
        "job_seeker",
        "support",
      ],
      application_status: [
        "submitted",
        "reviewing",
        "shortlisted",
        "interview",
        "offered",
        "hired",
        "rejected",
        "withdrawn",
      ],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "internship",
        "temporary",
        "freelance",
      ],
      experience_level: [
        "entry",
        "junior",
        "mid",
        "senior",
        "lead",
        "executive",
      ],
      job_status: ["draft", "published", "closed", "archived"],
      language_code: ["en", "sw"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
