import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'
import { DashboardData } from '@/types'

// GET /api/dashboard - Get comprehensive dashboard data
export const GET = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch all dashboard data in parallel
    const [
      userData,
      todayCheckin,
      activeStreaks,
      activeHabits,
      todayTasks,
      recentCompletions,
      weeklyAnalytics
    ] = await Promise.all([
      // User data
      supabase
        .from('users')
        .select('*')
        .eq('id', context.userId)
        .single(),
        
      // Today's emotion check-in
      supabase
        .from('emotion_checkins')
        .select('*')
        .eq('user_id', context.userId)
        .eq('date', today)
        .single(),
        
      // Active streaks
      supabase
        .from('streaks')
        .select('*')
        .eq('user_id', context.userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
        
      // Active habits with streak info
      supabase
        .from('habits')
        .select(`
          *,
          streaks!inner (
            title,
            state,
            current_count
          )
        `)
        .eq('user_id', context.userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false }),
        
      // Today's tasks
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', context.userId)
        .or(`due_date.is.null,due_date.eq.${today}`)
        .order('created_at', { ascending: false }),
        
      // Recent completions (last 7 days)
      supabase
        .from('habit_completions')
        .select(`
          *,
          habits!inner (
            title,
            difficulty_level
          )
        `)
        .eq('user_id', context.userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false }),
        
      // Weekly analytics
      supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', context.userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
    ])

    // Handle errors
    if (userData.error) throw userData.error

    // Check if user needs to complete emotion check-in
    const needsCheckin = !todayCheckin.data

    // Structure dashboard data
    const dashboardData: DashboardData = {
      user: userData.data,
      todayCheckin: todayCheckin.data || undefined,
      activeStreaks: activeStreaks.data || [],
      todayHabits: activeHabits.data || [],
      todayTasks: todayTasks.data || [],
      recentCompletions: recentCompletions.data || [],
      weeklyAnalytics: weeklyAnalytics.data || [],
      needsCheckin,
    }

    // Calculate additional insights
    const insights = {
      totalActiveStreaks: dashboardData.activeStreaks.length,
      longestCurrentStreak: Math.max(0, ...dashboardData.activeStreaks.map(s => s.current_count)),
      todayCompletedHabits: dashboardData.recentCompletions
        .filter(c => c.date === today).length,
      todayCompletedTasks: dashboardData.todayTasks
        .filter(t => t.is_completed).length,
      weeklyConsistency: dashboardData.recentCompletions.length / 7,
      streaksInRecovery: dashboardData.activeStreaks
        .filter(s => s.state === 'recovery').length,
    }

    return NextResponse.json({
      data: dashboardData,
      insights,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    )
  }
})