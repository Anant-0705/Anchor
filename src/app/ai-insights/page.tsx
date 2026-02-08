'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, TrendingUp, AlertCircle, Lightbulb, CheckCircle2, Clock, Zap } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

export default function AIInsightsPage() {
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [triggering, setTriggering] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAIDecisions()
  }, [])

  const loadAIDecisions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/ai/decisions?limit=20')
      if (!response.ok) throw new Error('Failed to load AI decisions')
      const result = await response.json()
      setDecisions(result.data || [])
    } catch (err) {
      setError('Failed to load AI insights')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const triggerNewDecision = async () => {
    try {
      setTriggering(true)
      const response = await fetch('/api/ai/decision', {
        method: 'POST',
      })
      
      if (response.ok) {
        await loadAIDecisions() // Refresh the list
      }
    } catch (err) {
      setError('Failed to trigger AI decision')
      console.error(err)
    } finally {
      setTriggering(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'pressure_adjustment': return <TrendingUp className="w-5 h-5 text-orange-600" />
      case 'notification': return <Lightbulb className="w-5 h-5 text-blue-600" />
      case 'streak_state_change': return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'task_modification': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'no_action': return <CheckCircle2 className="w-5 h-5 text-gray-600" />
      default: return <Brain className="w-5 h-5 text-purple-600" />
    }
  }

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'pressure_adjustment': return 'Difficulty Adjustment'
      case 'notification': return 'Supportive Guidance'
      case 'streak_state_change': return 'Streak Mode Change'
      case 'task_modification': return 'Task Modification'
      case 'no_action': return 'No Action Needed'
      default: return 'AI Decision'
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
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-500">See how Anchor's AI is helping optimize your journey</p>
          </div>
        </div>
        <Button 
          onClick={triggerNewDecision} 
          disabled={triggering}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {triggering ? 'Analyzing...' : 'Get AI Advice'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {decisions.length === 0 ? (
        <motion.div variants={item} className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="w-12 h-12 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No AI insights yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            As you use Anchor, our AI will analyze your patterns and provide personalized guidance
            to help optimize your habits and maintain consistency.
          </p>
          <Button onClick={triggerNewDecision} size="lg" disabled={triggering} className="bg-purple-600 hover:bg-purple-700">
            <Brain className="w-5 h-5 mr-2" />
            {triggering ? 'Analyzing...' : 'Get First AI Insight'}
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <motion.div variants={item}>
            <GlassCard className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                How AI Helps You
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Difficulty Adjustment</div>
                    <div className="text-gray-600">Automatically adjusts habit difficulty based on your emotional state</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Recovery Mode</div>
                    <div className="text-gray-600">Switches streaks to recovery mode when you're overwhelmed</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Supportive Guidance</div>
                    <div className="text-gray-600">Provides encouraging suggestions without guilt or pressure</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">Smart Optimization</div>
                    <div className="text-gray-600">Learns from your patterns to optimize your routine</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent AI Decisions</h3>
            {decisions.map((decision: any) => (
              <motion.div key={decision.id} variants={item}>
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getActionIcon(decision.decision_type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getActionTitle(decision.decision_type)}
                        </h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeDate(decision.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {Math.round((decision.decision?.confidence || 0) * 100)}% confidence
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        decision.executed_at 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {decision.executed_at ? 'Applied' : 'Not Applied'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {decision.decision?.reasoning || 'No reasoning provided'}
                    </p>
                  </div>

                  {decision.execution_time_ms && (
                    <div className="mt-3 text-xs text-gray-500">
                      Processed in {decision.execution_time_ms}ms using {decision.model_used}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}