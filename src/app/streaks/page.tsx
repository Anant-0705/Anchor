'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { Streak } from '@/types'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Plus, Target, Flame, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { getStreakStateColor } from '@/lib/utils'
import Link from 'next/link'
import { CreateStreakModal } from '@/components/forms/CreateStreakModal'

export default function StreaksPage() {
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadStreaks()
  }, [])

  const loadStreaks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/streaks')
      if (!response.ok) throw new Error('Failed to load streaks')
      const result = await response.json()
      setStreaks(result.data)
    } catch (err) {
      setError('Failed to load streaks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStreak = async (data: { title: string; description?: string }) => {
    try {
      const response = await fetch('/api/streaks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to create streak')
      await loadStreaks()
      setShowCreateModal(false)
    } catch (err) {
      setError('Failed to create streak')
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
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Streaks</h1>
            <p className="text-gray-500">Build habits around who you want to be</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Streak
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {streaks.length === 0 ? (
        <motion.div variants={item} className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Target className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No streaks yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building consistent habits by creating your first identity-based streak. 
            Think "I am someone who..." instead of "I want to do..."
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Streak
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {streaks.map((streak) => (
            <motion.div key={streak.id} variants={item}>
              <GlassCard className="h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStreakStateColor(streak.state)}`}>
                      {streak.state}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{streak.title}</h3>
                
                {streak.description && (
                  <p className="text-sm text-gray-600 mb-4">{streak.description}</p>
                )}

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{streak.current_count}</div>
                    <div className="text-sm text-gray-500">Current streak</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-700">{streak.longest_count}</div>
                    <div className="text-xs text-gray-500">Best ever</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (streak.current_count / (streak.longest_count || 1)) * 100)}%` }}
                  />
                </div>

                <div className="flex space-x-2">
                  <Link href={`/streaks/${streak.id}/habits`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      View Habits
                    </Button>
                  </Link>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                    Continue Streak
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <CreateStreakModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateStreak}
      />
    </motion.div>
  )
}