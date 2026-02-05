-- Migration: Initial Anchor Schema
-- Created: 2026-01-15
-- Description: Create initial tables, indexes, RLS policies, and functions

-- This migration sets up the complete database schema for Anchor
-- Run this file in your Supabase SQL editor

BEGIN;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE emotion_state AS ENUM ('energized', 'okay', 'low', 'overwhelmed');

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

-- Identity-based streaks
CREATE TABLE public.streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  current_count INTEGER DEFAULT 0,
  longest_count INTEGER DEFAULT 0,
  state TEXT DEFAULT 'normal' CHECK (state IN ('normal', 'recovery', 'protected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_completed_at DATE,
  is_active BOOLEAN DEFAULT true
);

-- Emotional check-ins
CREATE TABLE public.emotion_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  emotion emotion_state NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Habits
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

-- Tasks
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  estimated_effort INTEGER DEFAULT 1 CHECK (estimated_effort BETWEEN 1 AND 5),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habit completions
CREATE TABLE public.habit_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  streak_id UUID REFERENCES public.streaks(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  difficulty_completed INTEGER NOT NULL CHECK (difficulty_completed BETWEEN 1 AND 5),
  notes TEXT,
  UNIQUE(user_id, habit_id, date)
);

-- AI decisions
CREATE TABLE public.ai_decisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  decision_type TEXT NOT NULL,
  context JSONB NOT NULL,
  decision JSONB NOT NULL,
  prompt_version TEXT NOT NULL,
  model_used TEXT NOT NULL,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  outcome JSONB
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  ai_decision_id UUID REFERENCES public.ai_decisions(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  email_provider_id TEXT,
  delivery_status TEXT DEFAULT 'sent'
);

-- User analytics
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

-- Create indexes
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

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

COMMIT;