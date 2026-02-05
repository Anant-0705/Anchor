'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { EmotionState, EMOTION_LABELS } from '@/types'
import { getEmotionEmoji } from '@/lib/utils'

interface EmotionCheckinProps {
  onCheckinComplete: (emotion: EmotionState, notes?: string) => void
  loading?: boolean
}

export function EmotionCheckin({ onCheckinComplete, loading }: EmotionCheckinProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionState | null>(null)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedEmotion) {
      onCheckinComplete(selectedEmotion, notes.trim() || undefined)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-black">Daily Emotional Check-in</CardTitle>
        <CardDescription>
          How are you feeling today? This helps Anchor adjust your experience.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Choose your current emotion:</Label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(EMOTION_LABELS) as [EmotionState, string][]).map(([emotion, label]) => (
                <button
                  key={emotion}
                  type="button"
                  onClick={() => setSelectedEmotion(emotion)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${selectedEmotion === emotion
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getEmotionEmoji(emotion)}</span>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-500">
                        {emotion === 'energized' && 'Ready to take on challenges'}
                        {emotion === 'okay' && 'Feeling balanced and steady'}
                        {emotion === 'low' && 'Could use some gentle support'}
                        {emotion === 'overwhelmed' && 'Feeling stressed or anxious'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional notes (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything specific affecting how you feel today?"
              className="w-full p-3 border border-gray-300 rounded-md resize-none h-20 text-sm"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {notes.length}/500 characters
            </div>
          </div>

          <Button
            type="submit"
            disabled={!selectedEmotion || loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Saving...' : 'Complete Check-in'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Your privacy matters:</strong> Emotional check-ins help Anchor provide 
            personalized support without judgment. This data is private and never shared.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}