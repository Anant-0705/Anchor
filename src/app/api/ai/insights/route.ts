import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'

// GET /api/ai/insights - Get personalized AI insights for user
export const GET = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const supabase = await createClient()
    
    // Get recent AI decisions
    const { data: recentDecisions } = await supabase
      .from('ai_decisions')
      .select('*')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get user context manually for now
    const [
      userData,
      todayEmotion,
      activeStreaks,
      recentCompletions,
      weeklyAnalytics
    ] = await Promise.all([
      supabase.from('users').select('*').eq('id', context.userId).single(),
      supabase.from('emotion_checkins').select('*').eq('user_id', context.userId).eq('date', new Date().toISOString().split('T')[0]).single(),
      supabase.from('streaks').select('*').eq('user_id', context.userId).eq('is_active', true),
      supabase.from('habit_completions').select('*').eq('user_id', context.userId).gte('date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
      supabase.from('user_analytics').select('*').eq('user_id', context.userId).gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ])
    
    const userContext = {
      user: userData.data,
      emotion: todayEmotion.data,
      streaks: activeStreaks.data || [],
      completions: recentCompletions.data || [],
      analytics: weeklyAnalytics.data || [],
    }
    
    // Calculate insights
    const insights = {
      consistency: calculateConsistencyScore(userContext.completions),
      emotionalTrend: analyzeEmotionalTrend(userContext.analytics),
      streakHealth: analyzeStreakHealth(userContext.streaks),
      recommendations: generateRecommendations(userContext),
      lastAIDecision: recentDecisions?.[0] || null,
      nextSuggestedAction: getNextSuggestedAction(userContext),
    }

    return NextResponse.json({
      data: insights,
    })
  } catch (error) {
    console.error('AI insights error:', error)
    return NextResponse.json(
      { error: 'Failed to load AI insights' },
      { status: 500 }
    )
  }
})

// Helper functions for AI insights
function calculateConsistencyScore(completions: any[]): number {
  if (completions.length === 0) return 0
  const last7Days = completions.filter(c => 
    new Date(c.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  )
  return Math.min(100, (last7Days.length / 7) * 100)
}

function analyzeEmotionalTrend(analytics: any[]): 'improving' | 'stable' | 'declining' | 'unknown' {
  if (analytics.length < 3) return 'unknown'
  
  const emotionScores = analytics.slice(0, 7).map(a => {
    switch (a.emotion_state) {
      case 'energized': return 4
      case 'okay': return 3
      case 'low': return 2
      case 'overwhelmed': return 1
      default: return 3
    }
  }).reverse()

  const trend = emotionScores.slice(-3).reduce((a: number, b: number) => a + b, 0) - 
                emotionScores.slice(0, 3).reduce((a: number, b: number) => a + b, 0)
  
  if (trend > 1) return 'improving'
  if (trend < -1) return 'declining'
  return 'stable'
}

function analyzeStreakHealth(streaks: any[]): 'excellent' | 'good' | 'needs_attention' | 'none' {
  if (streaks.length === 0) return 'none'
  
  const avgStreakLength = streaks.reduce((sum, s) => sum + s.current_count, 0) / streaks.length
  const recoveryStreaks = streaks.filter(s => s.state === 'recovery').length
  
  if (avgStreakLength >= 7 && recoveryStreaks === 0) return 'excellent'
  if (avgStreakLength >= 3 && recoveryStreaks <= 1) return 'good'
  return 'needs_attention'
}

function generateRecommendations(context: any): string[] {
  const recommendations = []
  
  if (context.emotion?.emotion === 'overwhelmed') {
    recommendations.push('Consider switching to recovery mode for easier habits')
    recommendations.push('Focus on just showing up today, even if briefly')
  }
  
  if (context.streaks.filter((s: any) => s.current_count === 0).length > 0) {
    recommendations.push('Restart a streak with the smallest possible version')
  }
  
  if (context.completions.filter((c: any) => c.date === new Date().toISOString().split('T')[0]).length === 0) {
    recommendations.push('Complete at least one small habit today to maintain momentum')
  }
  
  return recommendations.slice(0, 3) // Limit to 3 recommendations
}

function getNextSuggestedAction(context: any): string {
  if (!context.emotion) {
    return 'Complete your daily emotion check-in for personalized guidance'
  }
  
  const todayCompletions = context.completions.filter((c: any) => 
    c.date === new Date().toISOString().split('T')[0]
  ).length
  
  if (todayCompletions === 0) {
    const easiestHabit = context.habits
      .filter((h: any) => h.is_active)
      .sort((a: any, b: any) => a.difficulty_level - b.difficulty_level)[0]
    
    if (easiestHabit) {
      return `Start with your easiest habit: "${easiestHabit.title}"`
    }
    
    return 'Create your first habit to begin building consistency'
  }
  
  return 'Great progress today! Consider completing another habit if you have energy'
}