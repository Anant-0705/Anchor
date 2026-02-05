'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { DashboardData, EmotionState } from '@/types'
import { EmotionCheckin } from '@/components/forms/EmotionCheckin'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getEmotionColor, getEmotionEmoji, getStreakStateColor, getDifficultyColor, formatRelativeDate } from '@/lib/utils'
import { Flame, CheckCircle2, Circle, TrendingUp, Calendar, AlertCircle, ListTodo, Brain, Lightbulb, Zap } from 'lucide-react'
import { CompleteHabitModal } from '@/components/forms/CompleteHabitModal'
import { AINotification } from '@/components/ui/AINotification'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [completeHabit, setCompleteHabit] = useState<any>(null)
  const [aiInsights, setAiInsights] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiNotification, setAiNotification] = useState<any>(null)
  const [showAiNotification, setShowAiNotification] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboard()
    loadAIInsights()
  }, [])

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to load dashboard')
      const result = await response.json()
      
      // Check if user needs onboarding
      if (!result.data.user.onboarded_at && result.data.activeStreaks.length === 0) {
        router.push('/onboarding')
        return
      }
      
      setDashboardData(result.data)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmotionCheckin = async (emotion: EmotionState, notes?: string) => {
    setCheckinLoading(true)
    try {
      const response = await fetch('/api/emotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotion, notes }),
      })
      if (!response.ok) throw new Error('Failed to save emotion check-in')
      await loadDashboard()
      
      // Trigger AI decision after emotion check-in
      if (emotion === 'low' || emotion === 'overwhelmed') {
        setTimeout(() => triggerAIDecision(), 2000)
      }
    } catch (err) {
      setError('Failed to save emotion check-in')
    } finally {
      setCheckinLoading(false)
    }
  }

  const handleCompleteHabit = async (habitId: string, data: { difficulty_completed: number; notes?: string }) => {
    try {
      const response = await fetch(`/api/habits/${habitId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to complete habit')
      await loadDashboard()
      setCompleteHabit(null)
      
      // Trigger AI decision periodically (after every few completions)
      const completionCount = dashboardData?.recentCompletions.filter(c => 
        c.date === new Date().toISOString().split('T')[0]
      ).length || 0
      
      if (completionCount % 2 === 1) { // Every other completion
        setTimeout(() => triggerAIDecision(), 3000)
      }
    } catch (err) {
      setError('Failed to complete habit')
      console.error(err)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) throw new Error('Failed to complete task')
      await loadDashboard()
    } catch (err) {
      setError('Failed to complete task')
      console.error(err)
    }
  }

  const loadAIInsights = async () => {
    try {
      setAiLoading(true)
      const response = await fetch('/api/ai/insights')
      if (response.ok) {
        const result = await response.json()
        setAiInsights(result.data)
      }
    } catch (err) {
      // AI insights are optional, don't show error
      console.warn('Failed to load AI insights:', err)
    } finally {
      setAiLoading(false)
    }
  }

  const triggerAIDecision = async () => {
    try {
      setAiLoading(true)
      const response = await fetch('/api/ai/decision', {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        setAiInsights((prev: any) => ({
          ...prev,
          lastDecision: result.data,
          lastUpdated: new Date().toISOString()
        }))
        
        // Show AI notification
        setAiNotification(result.data)
        setShowAiNotification(true)
        
        await loadDashboard() // Refresh to show any changes
      }
    } catch (err) {
      console.error('Failed to trigger AI decision:', err)
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-gray-600 font-medium">{error}</p>
        <Button onClick={loadDashboard}>Try Again</Button>
      </div>
    )
  }

  if (!dashboardData) return null

  // Needs check-in view
  if (dashboardData.needsCheckin) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Good morning! ☀️</h1>
          <p className="text-lg text-gray-600">Before we dive in, how are you feeling today?</p>
        </motion.div>

        <GlassCard className="p-8">
          <EmotionCheckin
            onCheckinComplete={handleEmotionCheckin}
            loading={checkinLoading}
          />
        </GlassCard>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {dashboardData.user.full_name?.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/analytics">
            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <div className="text-sm font-medium text-gray-500 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mood Widget */}
        <motion.div variants={item} className="md:col-span-1">
          <GlassCard className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <TrendingUp size={18} />
              </span>
              Current Mood
            </h3>
            {dashboardData.todayCheckin && (
              <div className="text-center py-6">
                <div className="text-6xl mb-4 animate-bounce-slow">
                  {getEmotionEmoji(dashboardData.todayCheckin.emotion)}
                </div>
                <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getEmotionColor(dashboardData.todayCheckin.emotion)}`}>
                  {dashboardData.todayCheckin.emotion}
                </div>
                {dashboardData.todayCheckin.notes && (
                  <p className="mt-4 text-sm text-gray-600 italic">"{dashboardData.todayCheckin.notes}"</p>
                )}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Streaks Widget */}
        <motion.div variants={item} className="md:col-span-2">
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <Flame size={18} />
                </span>
                Active Streaks
              </h3>
              <Link href="/streaks">
                <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
              </Link>
            </div>

            {dashboardData.activeStreaks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active streaks. Time to start something new!</p>
                <Link href="/streaks">
                  <Button variant="link" className="text-blue-600">Create Streak</Button>
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {dashboardData.activeStreaks.map((streak) => (
                  <div key={streak.id} className="group p-4 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{streak.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStreakStateColor(streak.state)}`}>
                        {streak.state}
                      </span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-gray-900">{streak.current_count}</span>
                      <span className="text-sm text-gray-500 mb-1.5">days</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (streak.current_count / (streak.longest_count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Insights */}
        <motion.div variants={item}>
          <GlassCard className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Brain size={18} />
                </span>
                AI Guidance
              </h3>
              <div className="flex space-x-2">
                <Link href="/ai-insights">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-purple-600"
                  >
                    View History
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={triggerAIDecision}
                  disabled={aiLoading}
                  className="text-purple-600"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  {aiLoading ? 'Thinking...' : 'Get Advice'}
                </Button>
              </div>
            </div>

            {aiInsights ? (
              <div className="space-y-4">
                {/* Next Suggested Action */}
                <div className="p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Suggestion</h4>
                      <p className="text-sm text-gray-700">{aiInsights.nextSuggestedAction}</p>
                    </div>
                  </div>
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {aiInsights.consistency}%
                    </div>
                    <div className="text-xs text-gray-600">7-Day Consistency</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-sm font-medium text-gray-900 mb-1 capitalize">
                      {aiInsights.emotionalTrend}
                    </div>
                    <div className="text-xs text-gray-600">Mood Trend</div>
                  </div>
                </div>

                {/* Recommendations */}
                {aiInsights.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Recommendations:</h4>
                    {aiInsights.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                      <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded border border-purple-100">
                        • {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto mb-4 text-purple-300" />
                <p className="text-sm text-gray-600 mb-4">Get personalized AI guidance based on your patterns</p>
                <Button 
                  onClick={loadAIInsights} 
                  variant="outline"
                  size="sm"
                  disabled={aiLoading}
                  className="border-purple-200 text-purple-600"
                >
                  {aiLoading ? 'Loading...' : 'Load Insights'}
                </Button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Quick Tasks */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle2 size={18} />
                </span>
                Today's Focus
              </h3>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-blue-600">View All Tasks</Button>
              </Link>
            </div>

            <div className="space-y-3">
              {dashboardData.todayTasks.filter(t => !t.is_completed).map((task) => (
                <div key={task.id} className="flex items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 mr-3 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">Effort: {task.estimated_effort}/5</p>
                  </div>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCompleteTask(task.id)}>Done</Button>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={item}>
          <GlassCard>
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <ListTodo size={18} />
              </span>
              Recent Victories
            </h3>

            <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 pl-6 py-2">
              {dashboardData.recentCompletions.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity.</p>
              ) : (
                dashboardData.recentCompletions.slice(0, 4).map((completion, idx) => (
                  <div key={completion.id} className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-blue-500 ring-4 ring-blue-50"></span>
                    <p className="font-medium text-gray-900">Completed a habit</p>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeDate(completion.date)} • Level {completion.difficulty_completed}</p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {completeHabit && (
        <CompleteHabitModal
          isOpen={true}
          onClose={() => setCompleteHabit(null)}
          onSubmit={(data) => handleCompleteHabit(completeHabit.id, data)}
          habit={completeHabit}
        />
      )}

      {aiNotification && (
        <AINotification
          isVisible={showAiNotification}
          onClose={() => setShowAiNotification(false)}
          decision={aiNotification}
        />
      )}
    </motion.div>
  )
}