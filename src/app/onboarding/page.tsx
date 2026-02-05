'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/auth/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/ui/glass-card'
import { 
  Target, Heart, Brain, Sparkles, ArrowRight, ArrowLeft, 
  CheckCircle2, Flame, Zap, Clock 
} from 'lucide-react'

type OnboardingStep = 'welcome' | 'identity' | 'first-streak' | 'first-habit' | 'complete'

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Form data
  const [streakTitle, setStreakTitle] = useState('')
  const [streakDescription, setStreakDescription] = useState('')
  const [habitTitle, setHabitTitle] = useState('')
  const [habitMinutes, setHabitMinutes] = useState(15)
  const [habitDifficulty, setHabitDifficulty] = useState(2)
  const [createdStreakId, setCreatedStreakId] = useState('')

  const steps: OnboardingStep[] = ['welcome', 'identity', 'first-streak', 'first-habit', 'complete']
  const currentIndex = steps.indexOf(step)

  const handleCreateStreak = async () => {
    if (!streakTitle.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/streaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: streakTitle.trim(),
          description: streakDescription.trim() || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to create streak')
      const result = await response.json()
      setCreatedStreakId(result.data.id)
      setStep('first-habit')
    } catch (err) {
      setError('Failed to create streak. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHabit = async () => {
    if (!habitTitle.trim() || !createdStreakId) return

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streak_id: createdStreakId,
          title: habitTitle.trim(),
          difficulty_level: habitDifficulty,
          estimated_minutes: habitMinutes,
        }),
      })

      if (!response.ok) throw new Error('Failed to create habit')
      
      // Mark user as onboarded
      await markUserOnboarded()
      setStep('complete')
    } catch (err) {
      setError('Failed to create habit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const markUserOnboarded = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await (supabase
          .from('users') as any)
          .update({ onboarded_at: new Date().toISOString() })
          .eq('id', user.id)
      }
    } catch (err) {
      console.error('Failed to mark user as onboarded:', err)
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {steps.map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className={`w-3 h-3 rounded-full transition-all ${
                  idx <= currentIndex 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`} />
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-0.5 transition-all ${
                    idx < currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" custom={1}>
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Anchor! 🎉
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  We're excited to help you build lasting habits without the guilt. 
                  Let's set up your first identity-based streak together.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">Identity-Based</h3>
                    <p className="text-sm text-gray-600">Focus on who you want to be</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">Emotion-Aware</h3>
                    <p className="text-sm text-gray-600">Adapts to how you feel</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Brain className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                    <p className="text-sm text-gray-600">Smart guidance without guilt</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setStep('identity')} 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Let's Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </GlassCard>
            </motion.div>
          )}

          {step === 'identity' && (
            <motion.div
              key="identity"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                    <Flame className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    The Power of Identity
                  </h2>
                  <p className="text-gray-600">
                    Instead of "I want to exercise", think "I am someone who prioritizes their health"
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-3">💡 Why Identity Matters</h3>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Goals tell you what you want. Identity tells you who you are.</li>
                    <li>• When your behavior matches your identity, it feels natural.</li>
                    <li>• You're not trying to form a habit—you're reinforcing who you are.</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Examples of Identity Statements:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-white rounded border border-gray-200">
                      "I am someone who reads every day"
                    </div>
                    <div className="p-3 bg-white rounded border border-gray-200">
                      "I am someone who exercises regularly"
                    </div>
                    <div className="p-3 bg-white rounded border border-gray-200">
                      "I am someone who practices gratitude"
                    </div>
                    <div className="p-3 bg-white rounded border border-gray-200">
                      "I am someone who learns continuously"
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('welcome')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep('first-streak')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create My First Streak
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 'first-streak' && (
            <motion.div
              key="first-streak"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Your First Streak
                  </h2>
                  <p className="text-gray-600">
                    What identity do you want to build? Start with one area of your life.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="streakTitle">Who do you want to be? *</Label>
                    <Input
                      id="streakTitle"
                      value={streakTitle}
                      onChange={(e) => setStreakTitle(e.target.value)}
                      placeholder="I am someone who..."
                      className="text-lg"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500">
                      {streakTitle.length}/200 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="streakDescription">Why is this important to you? (optional)</Label>
                    <textarea
                      id="streakDescription"
                      value={streakDescription}
                      onChange={(e) => setStreakDescription(e.target.value)}
                      placeholder="This matters to me because..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={500}
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('identity')}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateStreak}
                    disabled={!streakTitle.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Creating...' : 'Create Streak'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 'first-habit' && (
            <motion.div
              key="first-habit"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Add Your First Habit
                  </h2>
                  <p className="text-gray-600">
                    Now let's add a specific daily action that reinforces your identity.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                    Streak created: <strong>{streakTitle}</strong>
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="habitTitle">What's one thing you'll do daily? *</Label>
                    <Input
                      id="habitTitle"
                      value={habitTitle}
                      onChange={(e) => setHabitTitle(e.target.value)}
                      placeholder="e.g., Read for 20 minutes, Do 10 push-ups"
                      className="text-base"
                      maxLength={200}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time (minutes)
                      </Label>
                      <Input
                        type="number"
                        value={habitMinutes}
                        onChange={(e) => setHabitMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max="480"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty Level</Label>
                      <select
                        value={habitDifficulty}
                        onChange={(e) => setHabitDifficulty(parseInt(e.target.value))}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>Very Easy</option>
                        <option value={2}>Easy</option>
                        <option value={3}>Medium</option>
                        <option value={4}>Hard</option>
                        <option value={5}>Very Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Start Small</h4>
                    <p className="text-sm text-blue-700">
                      Begin with the smallest version of your habit. You can always increase 
                      the difficulty later. Consistency beats intensity!
                    </p>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('first-streak')}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleCreateHabit}
                    disabled={!habitTitle.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Creating...' : 'Complete Setup'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              key="complete"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={1}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </motion.div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  You're All Set! 🎉
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Your first streak and habit are ready. Start your journey 
                  by doing your daily emotion check-in.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">What happens next:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-blue-600">1</span>
                      </div>
                      <p className="text-gray-700">Complete your daily emotion check-in</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-purple-600">2</span>
                      </div>
                      <p className="text-gray-700">Complete your habits to build your streak</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="font-bold text-green-600">3</span>
                      </div>
                      <p className="text-gray-700">Get AI-powered guidance along the way</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={goToDashboard}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}