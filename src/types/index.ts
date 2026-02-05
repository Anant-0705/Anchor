// Core TypeScript types for the Anchor application

// Emotion types
export type EmotionState = 'energized' | 'okay' | 'low' | 'overwhelmed'

export interface EmotionCheckin {
  id: string
  user_id: string
  emotion: EmotionState
  notes?: string
  date: string
  created_at: string
}

// Streak types
export type StreakState = 'normal' | 'recovery' | 'protected'

export interface Streak {
  id: string
  user_id: string
  title: string
  description?: string
  current_count: number
  longest_count: number
  state: StreakState
  created_at: string
  updated_at: string
  last_completed_at?: string
  is_active: boolean
}

// User types
export interface User {
  id: string
  email: string
  full_name?: string
  timezone: string
  created_at: string
  updated_at: string
  onboarded_at?: string
  last_seen_at: string
}

// Habit types
export interface Habit {
  id: string
  user_id: string
  streak_id: string
  title: string
  description?: string
  difficulty_level: number // 1-5
  estimated_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Task types
export interface Task {
  id: string
  user_id: string
  habit_id?: string
  title: string
  description?: string
  estimated_effort: number // 1-5
  due_date?: string
  completed_at?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

// Habit completion types
export interface HabitCompletion {
  id: string
  user_id: string
  habit_id: string
  streak_id: string
  completed_at: string
  date: string
  difficulty_completed: number // 1-5
  notes?: string
}

// AI Decision types
export interface AIDecisionContext {
  user_id: string
  current_emotion?: EmotionState
  recent_emotions: EmotionCheckin[]
  streaks: Streak[]
  habits: Habit[]
  tasks: Task[]
  recent_completions: HabitCompletion[]
  missed_days: number
  recovery_days: number
}

export interface AIDecision {
  action: 'pressure_adjustment' | 'notification' | 'streak_state_change' | 'task_modification' | 'no_action'
  reasoning: string
  confidence: number // 0-1
  parameters?: {
    new_difficulty?: number
    new_streak_state?: StreakState
    notification_type?: string
    notification_tone?: 'supportive' | 'encouraging' | 'gentle'
    task_modifications?: {
      task_id: string
      new_effort: number
    }[]
  }
}

export interface AIDecisionLog {
  id: string
  user_id: string
  decision_type: string
  context: AIDecisionContext
  decision: AIDecision
  prompt_version: string
  model_used: string
  execution_time_ms?: number
  created_at: string
  executed_at?: string
  outcome?: any
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  ai_decision_id?: string
  type: string
  subject: string
  content: string
  sent_at: string
  opened_at?: string
  clicked_at?: string
  email_provider_id?: string
  delivery_status: string
}

// Analytics types
export interface UserAnalytics {
  id: string
  user_id: string
  date: string
  total_habits_completed: number
  total_tasks_completed: number
  average_difficulty_completed?: number
  emotion_state?: EmotionState
  streak_recovery_days: number
  ai_interventions_count: number
  created_at: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: 'success' | 'error'
}

// Form types
export interface CreateStreakForm {
  title: string
  description?: string
}

export interface CreateHabitForm {
  streak_id: string
  title: string
  description?: string
  difficulty_level: number
  estimated_minutes: number
}

export interface CreateTaskForm {
  habit_id?: string
  title: string
  description?: string
  estimated_effort: number
  due_date?: string
}

export interface EmotionCheckinForm {
  emotion: EmotionState
  notes?: string
}

// Dashboard data aggregations
export interface DashboardData {
  user: User
  todayCheckin?: EmotionCheckin
  activeStreaks: Streak[]
  todayHabits: Habit[]
  todayTasks: Task[]
  recentCompletions: HabitCompletion[]
  weeklyAnalytics: UserAnalytics[]
  needsCheckin: boolean
}

// AI Context for decision making
export interface AIContext {
  user: User
  emotion: EmotionCheckin | null
  streaks: Streak[]
  habits: Habit[]
  tasks: Task[]
  completions: HabitCompletion[]
  analytics: UserAnalytics[]
}

// Utility types for API routes
export interface RouteParams {
  [key: string]: string
}

export interface AuthenticatedRequest extends Request {
  userId: string
}

// Constants
export const EMOTION_LABELS: Record<EmotionState, string> = {
  energized: 'Energized',
  okay: 'Okay',
  low: 'Low',
  overwhelmed: 'Overwhelmed'
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy', 
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard'
}

export const EFFORT_LABELS: Record<number, string> = {
  1: 'Minimal',
  2: 'Light',
  3: 'Moderate', 
  4: 'Significant',
  5: 'Intense'
}