-- Migration: Functions and Triggers
-- Created: 2026-01-15
-- Description: Add utility functions and triggers for streak management

BEGIN;

-- Function to update streak counts automatically
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

-- Trigger function for updating streak counts
CREATE OR REPLACE FUNCTION trigger_update_streak_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM update_streak_count(NEW.streak_id, NEW.user_id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM update_streak_count(OLD.streak_id, OLD.user_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER habit_completions_update_streak
  AFTER INSERT OR UPDATE OR DELETE ON public.habit_completions
  FOR EACH ROW EXECUTE FUNCTION trigger_update_streak_count();

-- Function to check if user has completed daily emotion check-in
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

-- Function to get user's current emotional context for AI
CREATE OR REPLACE FUNCTION get_user_emotional_context(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'current_emotion', ec.emotion,
    'emotion_notes', ec.notes,
    'emotion_date', ec.date,
    'recent_emotions', (
      SELECT json_agg(
        json_build_object(
          'date', date,
          'emotion', emotion,
          'notes', notes
        )
      )
      FROM emotion_checkins 
      WHERE user_id = user_uuid 
        AND date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date DESC
    )
  )
  INTO result
  FROM emotion_checkins ec
  WHERE ec.user_id = user_uuid
    AND ec.date = CURRENT_DATE;
    
  RETURN COALESCE(result, json_build_object('current_emotion', null, 'recent_emotions', '[]'::json));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;