-- Anchor Database Schema
-- Production-quality schema for emotion-aware productivity application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  onboarded_at TIMESTAMP WITH TIME ZONE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Identity-based streaks (core feature)
CREATE TABLE public.streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, -- "I am someone who exercises daily"
  description TEXT,
  current_count INTEGER DEFAULT 0,
  longest_count INTEGER DEFAULT 0,
  state TEXT DEFAULT 'normal' CHECK (state IN ('normal', 'recovery', 'protected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_completed_at DATE,
  is_active BOOLEAN DEFAULT true
);

-- Emotional check-ins (mandatory daily)
CREATE TYPE emotion_state AS ENUM ('energized', 'okay', 'low', 'overwhelmed');

CREATE TABLE public.emotion_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  emotion emotion_state NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- Enforce one check-in per day per user
  UNIQUE(user_id, date)
);

-- Habits linked to streaks
CREATE TABLE public.habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  streak_id UUID REFERENCES public.streaks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_minutes INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Daily tasks for productivity
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_effort INTEGER DEFAULT 1 CHECK (estimated_effort BETWEEN 1 AND 5), -- 1=easy, 5=very hard
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habit completions for tracking
CREATE TABLE public.habit_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  streak_id UUID REFERENCES public.streaks(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  difficulty_completed INTEGER NOT NULL CHECK (difficulty_completed BETWEEN 1 AND 5),
  notes TEXT,
  -- Prevent duplicate completions per day
  UNIQUE(user_id, habit_id, date)
);

-- AI decision logs for observability
CREATE TABLE public.ai_decisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  decision_type TEXT NOT NULL, -- 'pressure_adjustment', 'notification', 'streak_state_change', 'task_modification'
  context JSONB NOT NULL, -- Contains emotion, streak data, habits, tasks
  decision JSONB NOT NULL, -- The AI's decision and reasoning
  prompt_version TEXT NOT NULL,
  model_used TEXT NOT NULL, -- 'gemini-flash-lite', 'gemini-flash', 'gemini-pro'
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  outcome JSONB -- Results of executing the decision
);

-- Email notifications sent
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  ai_decision_id UUID REFERENCES public.ai_decisions(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'supportive', 'check_in_reminder', 'streak_celebration'
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  email_provider_id TEXT, -- External email service tracking ID
  delivery_status TEXT DEFAULT 'sent' -- 'sent', 'delivered', 'bounced', 'failed'
);

-- User analytics and insights
CREATE TABLE public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_habits_completed INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  average_difficulty_completed DECIMAL(3,2),
  emotion_state emotion_state,
  streak_recovery_days INTEGER DEFAULT 0,
  ai_interventions_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX idx_streaks_active ON public.streaks(user_id, is_active);

CREATE INDEX idx_emotion_checkins_user_date ON public.emotion_checkins(user_id, date DESC);

CREATE INDEX idx_habits_user_streak ON public.habits(user_id, streak_id);
CREATE INDEX idx_habits_active ON public.habits(user_id, is_active);

CREATE INDEX idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_completed ON public.tasks(user_id, is_completed);

CREATE INDEX idx_habit_completions_user_date ON public.habit_completions(user_id, date DESC);
CREATE INDEX idx_habit_completions_habit_date ON public.habit_completions(habit_id, date DESC);

CREATE INDEX idx_ai_decisions_user_created ON public.ai_decisions(user_id, created_at DESC);
CREATE INDEX idx_ai_decisions_type ON public.ai_decisions(decision_type);

CREATE INDEX idx_notifications_user_sent ON public.notifications(user_id, sent_at DESC);

CREATE INDEX idx_user_analytics_user_date ON public.user_analytics(user_id, date DESC);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view their own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view their own streaks" ON public.streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own emotion check-ins" ON public.emotion_checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own habit completions" ON public.habit_completions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI decisions" ON public.ai_decisions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics" ON public.user_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_streak_count(streak_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_streak INTEGER := 0;
  longest_streak INTEGER := 0;
BEGIN
  -- Calculate current streak based on consecutive days
  WITH streak_days AS (
    SELECT date,
           date - (ROW_NUMBER() OVER (ORDER BY date))::INTEGER AS grp
    FROM habit_completions hc
    JOIN habits h ON h.id = hc.habit_id
    WHERE h.streak_id = streak_uuid 
      AND hc.user_id = user_uuid
      AND date >= CURRENT_DATE - INTERVAL '365 days'
    ORDER BY date
  ),
  consecutive_groups AS (
    SELECT grp, COUNT(*) as streak_length, MAX(date) as last_date
    FROM streak_days
    GROUP BY grp
  )
  SELECT COALESCE(MAX(streak_length), 0), 
         COALESCE(MAX(CASE WHEN last_date = CURRENT_DATE THEN streak_length ELSE 0 END), 0)
  INTO longest_streak, current_streak
  FROM consecutive_groups;

  UPDATE streaks 
  SET current_count = current_streak,
      longest_count = GREATEST(longest_count, longest_streak),
      updated_at = NOW()
  WHERE id = streak_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update streak counts automatically
CREATE OR REPLACE FUNCTION trigger_update_streak_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update streak count when habit completion is added/modified
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_streak_count(NEW.streak_id, NEW.user_id);
  END IF;
  
  -- Update streak count when habit completion is deleted
  IF TG_OP = 'DELETE' THEN
    PERFORM update_streak_count(OLD.streak_id, OLD.user_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habit_completions_update_streak
  AFTER INSERT OR UPDATE OR DELETE ON public.habit_completions
  FOR EACH ROW EXECUTE FUNCTION trigger_update_streak_count();

-- Function to ensure daily emotion check-in exists
CREATE OR REPLACE FUNCTION ensure_daily_checkin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM emotion_checkins 
    WHERE user_id = user_uuid 
      AND date = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;