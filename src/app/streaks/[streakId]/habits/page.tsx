'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/client'
import { Habit, Streak } from '@/types'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft, Clock, Zap, CheckCircle2, Circle } from 'lucide-react'
import { getDifficultyColor, getDifficultyLabel } from '@/lib/utils'
import Link from 'next/link'
import { CreateHabitModal } from '@/components/forms/CreateHabitModal'
import { CompleteHabitModal } from '@/components/forms/CompleteHabitModal'

export default function StreakHabitsPage() {
  const params = useParams()
  const router = useRouter()
  const [streak, setStreak] = useState<Streak | null>(null)
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [completeHabit, setCompleteHabit] = useState<Habit | null>(null)
  const supabase = createClient()
  const streakId = params.streakId as string

  useEffect(() => {
    if (streakId) {
      loadStreakData()
    }
  }, [streakId])

  const loadStreakData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load streak info
      const streakResponse = await fetch(`/api/streaks/${streakId}`)
      if (!streakResponse.ok) throw new Error('Failed to load streak')
      const streakResult = await streakResponse.json()
      setStreak(streakResult.data)

      // Load habits for this streak
      const habitsResponse = await fetch(`/api/habits?streak_id=${streakId}`)
      if (!habitsResponse.ok) throw new Error('Failed to load habits')
      const habitsResult = await habitsResponse.json()
      setHabits(habitsResult.data)
    } catch (err) {
      setError('Failed to load streak data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHabit = async (data: { title: string; description?: string; difficulty_level: number; estimated_minutes: number }) => {
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          streak_id: streakId,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create habit')
      await loadStreakData()
      setShowCreateModal(false)
    } catch (err) {
      setError('Failed to create habit')
      console.error(err)
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
      await loadStreakData()
      setCompleteHabit(null)
    } catch (err) {
      setError('Failed to complete habit')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!streak) {
    return (
      <div className="text-center py-16">
        <h1 className="text-xl font-semibold text-black mb-2">Streak not found</h1>
        <Link href="/streaks">
          <Button variant="outline">Back to Streaks</Button>
        </Link>
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
        <div className="flex items-center space-x-4">
          <Link href="/streaks">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Streaks
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-black">{streak.title}</h1>
            <p className="text-gray-500">Manage your daily habits</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {streak.description && (
        <GlassCard className="bg-blue-50 border-blue-200">
          <p className="text-blue-800">{streak.description}</p>
        </GlassCard>
      )}

      {habits.length === 0 ? (
        <motion.div variants={item} className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Zap className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add specific daily actions that will help you maintain this streak. 
            Keep them simple and achievable!
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Habit
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <motion.div key={habit.id} variants={item}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setCompleteHabit(habit)}
                      className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                    </button>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black">{habit.title}</h3>
                      {habit.description && (
                        <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{habit.estimated_minutes} min</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(habit.difficulty_level)}`}>
                          {getDifficultyLabel(habit.difficulty_level)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setCompleteHabit(habit)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete Today
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <CreateHabitModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateHabit}
        streakTitle={streak.title}
      />

      {completeHabit && (
        <CompleteHabitModal
          isOpen={true}
          onClose={() => setCompleteHabit(null)}
          onSubmit={(data) => handleCompleteHabit(completeHabit.id, data)}
          habit={completeHabit}
        />
      )}
    </motion.div>
  )
}