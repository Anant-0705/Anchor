'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { Task } from '@/types'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft, CheckCircle2, Circle, Calendar, Zap } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { CreateTaskModal } from '@/components/forms/CreateTaskModal'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to load tasks')
      const result = await response.json()
      setTasks(result.data)
    } catch (err) {
      setError('Failed to load tasks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (data: { title: string; description?: string; estimated_effort: number; due_date?: string; habit_id?: string }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to create task')
      await loadTasks()
      setShowCreateModal(false)
    } catch (err) {
      setError('Failed to create task')
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
      await loadTasks()
    } catch (err) {
      setError('Failed to complete task')
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

  const pendingTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

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
            <h1 className="text-3xl font-bold text-black">Tasks</h1>
            <p className="text-gray-500">Manage your daily productivity tasks</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Tasks */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <Circle className="w-5 h-5 text-orange-500" />
                Pending ({pendingTasks.length})
              </h3>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No pending tasks</p>
                <Button onClick={() => setShowCreateModal(true)} variant="link" className="text-blue-600">
                  Create your first task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="group p-4 rounded-lg bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <button 
                          onClick={() => handleCompleteTask(task.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors mt-0.5"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-black mb-1">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Effort: {task.estimated_effort}/5</span>
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due {formatDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleCompleteTask(task.id)}
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-green-600 hover:bg-green-700"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Completed Tasks */}
        <motion.div variants={item}>
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Completed ({completedTasks.length})
              </h3>
            </div>

            {completedTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No completed tasks yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedTasks.slice(0, 10).map((task) => (
                  <div key={task.id} className="p-4 rounded-lg bg-green-50 border border-green-100">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-black line-through mb-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Effort: {task.estimated_effort}/5</span>
                          {task.completed_at && (
                            <span>Completed {formatDate(task.completed_at)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
      />
    </motion.div>
  )
}