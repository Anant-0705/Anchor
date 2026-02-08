'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, TrendingUp, Calendar, Flame, Heart, 
  CheckCircle2, Target, BarChart3, Activity
} from 'lucide-react'
import { formatDate, getEmotionEmoji, getEmotionColor } from '@/lib/utils'
import Link from 'next/link'

interface AnalyticsData {
  weeklyCompletions: { date: string; count: number }[]
  emotionHistory: { date: string; emotion: string }[]
  streakStats: {
    totalStreaks: number
    longestStreak: number
    currentBestStreak: number
    streaksInRecovery: number
  }
  habitStats: {
    totalCompletions: number
    completionRate: number
    averageDifficulty: number
    favoriteHabit: string | null
  }
  weeklyTrend: 'improving' | 'stable' | 'declining' | 'unknown'
  consistencyScore: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('7')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/analytics?days=${timeRange}`)
      if (!response.ok) throw new Error('Failed to load analytics')
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError('Failed to load analytics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

  // Generate visual chart bars
  const maxCompletions = data ? Math.max(...data.weeklyCompletions.map(d => d.count), 1) : 1

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500">Track your progress and patterns</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {(['7', '14', '30'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-blue-600' : ''}
            >
              {range}d
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div variants={item}>
              <GlassCard className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {data.habitStats.totalCompletions}
                </div>
                <div className="text-sm text-gray-600">Total Completions</div>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {data.streakStats.currentBestStreak}
                </div>
                <div className="text-sm text-gray-600">Best Current Streak</div>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {Math.round(data.consistencyScore)}%
                </div>
                <div className="text-sm text-gray-600">Consistency Score</div>
              </GlassCard>
            </motion.div>

            <motion.div variants={item}>
              <GlassCard className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 capitalize">
                  {data.weeklyTrend}
                </div>
                <div className="text-sm text-gray-600">Weekly Trend</div>
              </GlassCard>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Completions Chart */}
            <motion.div variants={item}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Daily Completions
                  </h3>
                </div>
                
                <div className="flex items-end justify-between h-48 px-2">
                  {data.weeklyCompletions.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 mx-1">
                      <div className="w-full flex flex-col items-center justify-end h-40">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.count / maxCompletions) * 100}%` }}
                          transition={{ delay: idx * 0.1, duration: 0.5 }}
                          className="w-full max-w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                          style={{ minHeight: day.count > 0 ? '8px' : '0' }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-2 font-medium">
                        {day.count}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Emotion History */}
            <motion.div variants={item}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Emotion History
                  </h3>
                </div>

                <div className="space-y-3">
                  {data.emotionHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No emotion data yet</p>
                  ) : (
                    data.emotionHistory.slice(0, 7).map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getEmotionEmoji(entry.emotion)}</span>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">{entry.emotion}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(entry.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEmotionColor(entry.emotion)}`}>
                          {entry.emotion}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Streak Details */}
          <motion.div variants={item}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Streak Overview
                </h3>
                <Link href="/streaks">
                  <Button variant="ghost" size="sm" className="text-blue-600">Manage Streaks</Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    {data.streakStats.totalStreaks}
                  </div>
                  <div className="text-sm text-gray-600">Active Streaks</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-1">
                    {data.streakStats.longestStreak}
                  </div>
                  <div className="text-sm text-gray-600">Longest Ever</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-1">
                    {data.streakStats.currentBestStreak}
                  </div>
                  <div className="text-sm text-gray-600">Current Best</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-1">
                    {data.streakStats.streaksInRecovery}
                  </div>
                  <div className="text-sm text-gray-600">In Recovery</div>
                </div>
              </div>

              {data.habitStats.favoriteHabit && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">🏆 Your Most Completed Habit</h4>
                  <p className="text-blue-700">{data.habitStats.favoriteHabit}</p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Insights */}
          <motion.div variants={item}>
            <GlassCard className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Key Insights
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-purple-100">
                  <h4 className="font-medium text-gray-900 mb-2">Completion Rate</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(data.habitStats.completionRate)}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${data.habitStats.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2">Average Difficulty</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {data.habitStats.averageDifficulty.toFixed(1)}/5
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(level => (
                        <div 
                          key={level}
                          className={`w-6 h-6 rounded ${
                            level <= Math.round(data.habitStats.averageDifficulty)
                              ? 'bg-blue-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}