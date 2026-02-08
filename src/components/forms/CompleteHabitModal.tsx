'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Star } from 'lucide-react'
import { Habit } from '@/types'
import { getDifficultyLabel } from '@/lib/utils'

interface CompleteHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { difficulty_completed: number; notes?: string }) => void
  habit: Habit
}

export function CompleteHabitModal({ isOpen, onClose, onSubmit, habit }: CompleteHabitModalProps) {
  const [difficultyCompleted, setDifficultyCompleted] = useState(habit.difficulty_level)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    try {
      await onSubmit({
        difficulty_completed: difficultyCompleted,
        notes: notes.trim() || undefined,
      })
      // Reset form
      setDifficultyCompleted(habit.difficulty_level)
      setNotes('')
    } catch (error) {
      console.error('Error completing habit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setDifficultyCompleted(habit.difficulty_level)
      setNotes('')
      onClose()
    }
  }

  const difficultyOptions = [
    { value: 1, label: 'Very Easy', emoji: '😌', color: 'text-green-600' },
    { value: 2, label: 'Easy', emoji: '🙂', color: 'text-green-500' },
    { value: 3, label: 'Medium', emoji: '😐', color: 'text-yellow-500' },
    { value: 4, label: 'Hard', emoji: '😅', color: 'text-orange-500' },
    { value: 5, label: 'Very Hard', emoji: '😤', color: 'text-red-500' },
  ]

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
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Complete Habit</h2>
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
              <p className="text-green-100 text-sm mt-1">{habit.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Great job! 🎉
                </h3>
                <p className="text-gray-600">
                  How challenging was it to complete this habit today?
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Difficulty Level</Label>
                <div className="grid grid-cols-1 gap-2">
                  {difficultyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setDifficultyCompleted(option.value)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${difficultyCompleted === option.value
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{option.emoji}</span>
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">
                              Level {option.value}/5
                            </div>
                          </div>
                        </div>
                        {difficultyCompleted === option.value && (
                          <Star className="w-5 h-5 text-green-600 fill-current" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did it go? Any insights or challenges?"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">
                  {notes.length}/500 characters
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Your progress matters!</strong> Every completion builds momentum, 
                  regardless of the difficulty level. Consistency beats perfection.
                </p>
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
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Recording...' : 'Complete Habit'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}