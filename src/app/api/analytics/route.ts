import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Get habit completions for the period
    const { data: completions, error: completionsError } = await supabase
      .from('habit_completions')
      .select(`
        id,
        completed_at,
        difficulty_rating,
        habits!inner(id, name, streak_id, streaks!inner(user_id))
      `)
      .eq('habits.streaks.user_id', user.id)
      .gte('completed_at', startDateStr)
      .order('completed_at', { ascending: true })

    // Get emotion check-ins
    const { data: emotions, error: emotionsError } = await supabase
      .from('emotion_checkins')
      .select('id, emotion, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false })

    // Get streaks
    const { data: streaks, error: streaksError } = await supabase
      .from('streaks')
      .select('id, current_count, longest_count, status')
      .eq('user_id', user.id)

    // Get all habits to calculate completion rate
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('id, name, streak_id, streaks!inner(user_id)')
      .eq('streaks.user_id', user.id)

    if (completionsError || emotionsError || streaksError || habitsError) {
      throw new Error('Failed to fetch analytics data')
    }

    // Calculate weekly completions
    const weeklyCompletions = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = (completions || []).filter((c: any) => {
        const completedDate = new Date(c.completed_at).toISOString().split('T')[0]
        return completedDate === dateStr
      }).length

      weeklyCompletions.push({ date: dateStr, count })
    }

    // Calculate emotion history
    const emotionHistory = (emotions || []).map((e: any) => ({
      date: e.created_at,
      emotion: e.emotion
    }))

    // Calculate streak stats
    const activeStreaks = (streaks || []).filter((s: any) => s.status === 'active')
    const streakStats = {
      totalStreaks: activeStreaks.length,
      longestStreak: Math.max(...(streaks || []).map((s: any) => s.longest_count || 0), 0),
      currentBestStreak: Math.max(...activeStreaks.map((s: any) => s.current_count || 0), 0),
      streaksInRecovery: (streaks || []).filter((s: any) => s.status === 'recovery').length
    }

    // Calculate habit stats
    const totalCompletions = (completions || []).length
    const totalPossibleCompletions = (habits || []).length * days
    const completionRate = totalPossibleCompletions > 0 
      ? (totalCompletions / totalPossibleCompletions) * 100 
      : 0

    const avgDifficulty = totalCompletions > 0
      ? (completions || []).reduce((sum: number, c: any) => sum + (c.difficulty_rating || 3), 0) / totalCompletions
      : 3

    // Find favorite habit
    const habitCounts: Record<string, { name: string; count: number }> = {}
    ;(completions || []).forEach((c: any) => {
      const habit = c.habits as any
      if (habit?.name) {
        if (!habitCounts[habit.id]) {
          habitCounts[habit.id] = { name: habit.name, count: 0 }
        }
        habitCounts[habit.id].count++
      }
    })
    
    const favoriteHabit = Object.values(habitCounts).sort((a, b) => b.count - a.count)[0]?.name || null

    // Calculate weekly trend
    const halfPoint = Math.floor(weeklyCompletions.length / 2)
    const firstHalf = weeklyCompletions.slice(0, halfPoint).reduce((sum, d) => sum + d.count, 0)
    const secondHalf = weeklyCompletions.slice(halfPoint).reduce((sum, d) => sum + d.count, 0)
    
    let weeklyTrend: 'improving' | 'stable' | 'declining' | 'unknown' = 'unknown'
    if (totalCompletions > 0) {
      if (secondHalf > firstHalf * 1.2) {
        weeklyTrend = 'improving'
      } else if (secondHalf < firstHalf * 0.8) {
        weeklyTrend = 'declining'
      } else {
        weeklyTrend = 'stable'
      }
    }

    // Calculate consistency score
    const daysWithCompletions = weeklyCompletions.filter(d => d.count > 0).length
    const consistencyScore = (daysWithCompletions / days) * 100

    const habitStats = {
      totalCompletions,
      completionRate,
      averageDifficulty: avgDifficulty,
      favoriteHabit
    }

    return NextResponse.json({
      success: true,
      data: {
        weeklyCompletions,
        emotionHistory,
        streakStats,
        habitStats,
        weeklyTrend,
        consistencyScore
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}