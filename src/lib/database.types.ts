// Auto-generated TypeScript types for Supabase
// This file will be generated using: npm run db:generate-types

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
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          timezone: string
          created_at: string
          updated_at: string
          onboarded_at: string | null
          last_seen_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
          onboarded_at?: string | null
          last_seen_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
          onboarded_at?: string | null
          last_seen_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          current_count: number
          longest_count: number
          state: 'normal' | 'recovery' | 'protected'
          created_at: string
          updated_at: string
          last_completed_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          current_count?: number
          longest_count?: number
          state?: 'normal' | 'recovery' | 'protected'
          created_at?: string
          updated_at?: string
          last_completed_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          current_count?: number
          longest_count?: number
          state?: 'normal' | 'recovery' | 'protected'
          created_at?: string
          updated_at?: string
          last_completed_at?: string | null
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      emotion_checkins: {
        Row: {
          id: string
          user_id: string
          emotion: 'energized' | 'okay' | 'low' | 'overwhelmed'
          notes: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          emotion: 'energized' | 'okay' | 'low' | 'overwhelmed'
          notes?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          emotion?: 'energized' | 'okay' | 'low' | 'overwhelmed'
          notes?: string | null
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotion_checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      habits: {
        Row: {
          id: string
          user_id: string
          streak_id: string
          title: string
          description: string | null
          difficulty_level: number
          estimated_minutes: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_id: string
          title: string
          description?: string | null
          difficulty_level?: number
          estimated_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_id?: string
          title?: string
          description?: string | null
          difficulty_level?: number
          estimated_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habits_streak_id_fkey"
            columns: ["streak_id"]
            isOneToOne: false
            referencedRelation: "streaks"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          habit_id: string | null
          title: string
          description: string | null
          estimated_effort: number
          due_date: string | null
          completed_at: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          habit_id?: string | null
          title: string
          description?: string | null
          estimated_effort?: number
          due_date?: string | null
          completed_at?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string | null
          title?: string
          description?: string | null
          estimated_effort?: number
          due_date?: string | null
          completed_at?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_completions: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          streak_id: string
          completed_at: string
          date: string
          difficulty_completed: number
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          habit_id: string
          streak_id: string
          completed_at?: string
          date?: string
          difficulty_completed: number
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          habit_id?: string
          streak_id?: string
          completed_at?: string
          date?: string
          difficulty_completed?: number
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_streak_id_fkey"
            columns: ["streak_id"]
            isOneToOne: false
            referencedRelation: "streaks"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_decisions: {
        Row: {
          id: string
          user_id: string
          decision_type: string
          context: Json
          decision: Json
          prompt_version: string
          model_used: string
          execution_time_ms: number | null
          created_at: string
          executed_at: string | null
          outcome: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          decision_type: string
          context: Json
          decision: Json
          prompt_version: string
          model_used: string
          execution_time_ms?: number | null
          created_at?: string
          executed_at?: string | null
          outcome?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          decision_type?: string
          context?: Json
          decision?: Json
          prompt_version?: string
          model_used?: string
          execution_time_ms?: number | null
          created_at?: string
          executed_at?: string | null
          outcome?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_decisions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          ai_decision_id: string | null
          type: string
          subject: string
          content: string
          sent_at: string
          opened_at: string | null
          clicked_at: string | null
          email_provider_id: string | null
          delivery_status: string
        }
        Insert: {
          id?: string
          user_id: string
          ai_decision_id?: string | null
          type: string
          subject: string
          content: string
          sent_at?: string
          opened_at?: string | null
          clicked_at?: string | null
          email_provider_id?: string | null
          delivery_status?: string
        }
        Update: {
          id?: string
          user_id?: string
          ai_decision_id?: string | null
          type?: string
          subject?: string
          content?: string
          sent_at?: string
          opened_at?: string | null
          clicked_at?: string | null
          email_provider_id?: string | null
          delivery_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_ai_decision_id_fkey"
            columns: ["ai_decision_id"]
            isOneToOne: false
            referencedRelation: "ai_decisions"
            referencedColumns: ["id"]
          }
        ]
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          date: string
          total_habits_completed: number
          total_tasks_completed: number
          average_difficulty_completed: number | null
          emotion_state: 'energized' | 'okay' | 'low' | 'overwhelmed' | null
          streak_recovery_days: number
          ai_interventions_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          total_habits_completed?: number
          total_tasks_completed?: number
          average_difficulty_completed?: number | null
          emotion_state?: 'energized' | 'okay' | 'low' | 'overwhelmed' | null
          streak_recovery_days?: number
          ai_interventions_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          total_habits_completed?: number
          total_tasks_completed?: number
          average_difficulty_completed?: number | null
          emotion_state?: 'energized' | 'okay' | 'low' | 'overwhelmed' | null
          streak_recovery_days?: number
          ai_interventions_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_daily_checkin: {
        Args: {
          user_uuid: string
        }
        Returns: boolean
      }
      get_user_emotional_context: {
        Args: {
          user_uuid: string
        }
        Returns: Json
      }
      update_streak_count: {
        Args: {
          streak_uuid: string
          user_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      emotion_state: 'energized' | 'okay' | 'low' | 'overwhelmed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}