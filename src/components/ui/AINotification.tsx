'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, X, Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AINotificationProps {
  isVisible: boolean
  onClose: () => void
  decision: {
    action: string
    reasoning: string
    confidence: number
    executed: boolean
  }
}

export function AINotification({ isVisible, onClose, decision }: AINotificationProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'pressure_adjustment': return <TrendingUp className="w-5 h-5" />
      case 'notification': return <Lightbulb className="w-5 h-5" />
      case 'streak_state_change': return <AlertCircle className="w-5 h-5" />
      case 'no_action': return <CheckCircle2 className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getActionTitle = (action: string) => {
    switch (action) {
      case 'pressure_adjustment': return 'Difficulty Adjusted'
      case 'notification': return 'Guidance Provided'
      case 'streak_state_change': return 'Streak Mode Changed'
      case 'task_modification': return 'Tasks Modified'
      case 'no_action': return 'All Good!'
      default: return 'AI Decision'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'pressure_adjustment': return 'from-orange-500 to-yellow-500'
      case 'notification': return 'from-blue-500 to-purple-500'
      case 'streak_state_change': return 'from-red-500 to-pink-500'
      case 'task_modification': return 'from-green-500 to-teal-500'
      case 'no_action': return 'from-gray-500 to-slate-500'
      default: return 'from-purple-500 to-indigo-500'
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed top-4 right-4 z-50 w-80"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${getActionColor(decision.action)} px-4 py-3 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getActionIcon(decision.action)}
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
                {getActionIcon(decision.action)}
                {getActionTitle(decision.action)}
              </h4>
              
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {decision.reasoning}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Confidence: {Math.round(decision.confidence * 100)}%</span>
                <span className={`px-2 py-1 rounded ${decision.executed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {decision.executed ? 'Applied' : 'Not Applied'}
                </span>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onClose}
                  className="flex-1 text-xs"
                >
                  Got it
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                  onClick={onClose}
                >
                  Thanks!
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}