'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckSquare, Calendar } from 'lucide-react'
import { Habit } from '@/types'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description?: string; estimated_effort: number; due_date?: string; habit_id?: string }) => void
}

export function CreateTaskModal({ isOpen, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedEffort, setEstimatedEffort] = useState(3)
  const [dueDate, setDueDate] = useState('')
  const [habitId, setHabitId] = useState('')
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadHabits()
    }
  }, [isOpen])

  const loadHabits = async () => {
    try {
      const response = await fetch('/api/habits?active=true')
      if (!response.ok) return
      const result = await response.json()
      setHabits(result.data || [])
    } catch (error) {
      console.error('Failed to load habits:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        estimated_effort: estimatedEffort,
        due_date: dueDate || undefined,
        habit_id: habitId || undefined,
      })
      // Reset form
      setTitle('')
      setDescription('')
      setEstimatedEffort(3)
      setDueDate('')
      setHabitId('')
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTitle('')
      setDescription('')
      setEstimatedEffort(3)
      setDueDate('')
      setHabitId('')
      onClose()
    }
  }

  const effortLabels = {
    1: { label: 'Minimal', color: 'text-green-600' },
    2: { label: 'Light', color: 'text-green-500' },
    3: { label: 'Moderate', color: 'text-yellow-500' },
    4: { label: 'Significant', color: 'text-orange-500' },
    5: { label: 'Intense', color: 'text-red-500' },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Create New Task</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="text-base"
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional details or context?"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Estimated Effort</Label>
                  <select
                    value={estimatedEffort}
                    onChange={(e) => setEstimatedEffort(parseInt(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(effortLabels).map(([level, info]) => (
                      <option key={level} value={level}>
                        {level}/5 - {info.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date (optional)
                  </Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-base"
                  />
                </div>
              </div>

              {habits.length > 0 && (
                <div className="space-y-2">
                  <Label>Link to Habit (optional)</Label>
                  <select
                    value={habitId}
                    onChange={(e) => setHabitId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">No habit association</option>
                    {habits.map((habit) => (
                      <option key={habit.id} value={habit.id}>
                        {habit.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">✨ Task Tips:</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Break large tasks into smaller, actionable steps</li>
                  <li>• Set realistic effort estimates to avoid overwhelm</li>
                  <li>• Link tasks to habits to build consistency</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}