export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          current_medication: string
          current_dosage: string
          application_frequency_days: number
          preferred_application_day: string
          start_weight: number
          target_weight: number | null
          treatment_start_date: string
          goal: string
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      applications: {
        Row: {
          id: string
          user_id: string
          application_date: string
          application_time: string
          medication: string
          dosage: string
          injection_site: string
          injection_side: string
          pain_level: number
          symptoms: string[]
          mood: number
          energy: number
          appetite: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['applications']['Row']>
      }
      measurements: {
        Row: {
          id: string
          user_id: string
          record_date: string
          weight: number
          waist: number | null
          abdomen: number | null
          hips: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['measurements']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['measurements']['Row']>
      }
    }
  }
}
