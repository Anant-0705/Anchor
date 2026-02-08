'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { DashboardData, EmotionState } from '@/types'
import { EmotionCheckin } from '@/components/forms/EmotionCheckin'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { getEmotionColor, getEmotionEmoji, getStreakStateColor, getDifficultyColor, formatRelativeDate } from '@/lib/utils'
import { Flame, CheckCircle2, Circle, TrendingUp, Calendar, AlertCircle, ListTodo } from 'lucide-react'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboard()
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
    } catch (err) {
      setError('Failed to save emotion check-in')
    } finally {
      setCheckinLoading(false)
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
        <div className="text-sm font-medium text-gray-500 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
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
              <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
            </div>

            {dashboardData.activeStreaks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No active streaks. Time to start something new!</p>
                <Button variant="link" className="text-blue-600">Create Streak</Button>
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
        {/* Quick Tasks */}
        <motion.div variants={item}>
          <GlassCard>
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={18} />
              </span>
              Today's Focus
            </h3>

            <div className="space-y-3">
              {[...dashboardData.todayHabits, ...dashboardData.todayTasks].length === 0 ? (
                <p className="text-gray-500 text-center py-4">All caught up for today!</p>
              ) : (
                <>
                  {dashboardData.todayHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <button className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 mr-3 hover:border-blue-500 hover:bg-blue-50 transition-colors"></button>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{habit.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getDifficultyColor(habit.difficulty_level).replace('bg-', 'bg-')}`}></span>
                          {habit.estimated_minutes} min
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">Complete</Button>
                    </div>
                  ))}
                  {dashboardData.todayTasks.filter(t => !t.is_completed).map((task) => (
                    <div key={task.id} className="flex items-center group p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <button className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 mr-3 hover:border-blue-500 hover:bg-blue-50 transition-colors"></button>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">Effort calculation...</p>
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">Done</Button>
                    </div>
                  ))}
                </>
              )}
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
    </motion.div>
  )
}