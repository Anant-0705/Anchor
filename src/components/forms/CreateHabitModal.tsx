'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Clock, BarChart } from 'lucide-react'

interface CreateHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { title: string; description?: string; difficulty_level: number; estimated_minutes: number }) => void
  streakTitle: string
}

export function CreateHabitModal({ isOpen, onClose, onSubmit, streakTitle }: CreateHabitModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState(2)
  const [estimatedMinutes, setEstimatedMinutes] = useState(15)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty_level: difficultyLevel,
        estimated_minutes: estimatedMinutes,
      })
      // Reset form
      setTitle('')
      setDescription('')
      setDifficultyLevel(2)
      setEstimatedMinutes(15)
    } catch (error) {
      console.error('Error creating habit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setTitle('')
      setDescription('')
      setDifficultyLevel(2)
      setEstimatedMinutes(15)
      onClose()
    }
  }

  const difficultyLabels = {
    1: { label: 'Very Easy', color: 'text-green-600', desc: 'Almost effortless' },
    2: { label: 'Easy', color: 'text-green-500', desc: 'Minimal effort required' },
    3: { label: 'Medium', color: 'text-yellow-500', desc: 'Some focus needed' },
    4: { label: 'Hard', color: 'text-orange-500', desc: 'Significant effort' },
    5: { label: 'Very Hard', color: 'text-red-500', desc: 'Maximum effort' },
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Add New Habit</h2>
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
              <p className="text-blue-100 text-sm mt-1">For: {streakTitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Habit Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Read for 30 minutes, Do 20 push-ups"
                  className="text-base"
                  maxLength={200}
                  required
                />
                <div className="text-xs text-gray-500 text-right">
                  {title.length}/200 characters
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any specific details about how to complete this habit?"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">
                  {description.length}/500 characters
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Time (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="480"
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    Difficulty Level
                  </Label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(parseInt(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(difficultyLabels).map(([level, info]) => (
                      <option key={level} value={level}>
                        {info.label} - {info.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Tips for great habits:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Start small - you can always increase later</li>
                  <li>• Be specific about what "done" looks like</li>
                  <li>• Link to an existing routine when possible</li>
                  <li>• Focus on consistency over intensity</li>
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Creating...' : 'Create Habit'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}