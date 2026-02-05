import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIContext, AIDecision, EmotionState, StreakState } from '@/types'

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// AI Models configuration
export const AI_MODELS = {
  LITE: 'gemini-1.5-flash-8b',  // For routine decisions
  FLASH: 'gemini-1.5-flash',    // For complex decisions
  PRO: 'gemini-1.5-pro',        // For critical decisions
} as const

export type AIModelType = typeof AI_MODELS[keyof typeof AI_MODELS]

// Prompt versions for A/B testing and observability
export const PROMPT_VERSIONS = {
  CORE_V1: 'core_v1.0',
  SUPPORTIVE_V1: 'supportive_v1.0',
} as const

/**
 * Core AI Decision Engine for Anchor
 * 
 * This system makes emotion-aware decisions about:
 * - Pressure adjustment (difficulty scaling)
 * - Streak state changes (normal, recovery, protected)
 * - Notification sending (supportive, encouraging, gentle)
 * - Task modifications
 * 
 * Key principles:
 * - No guilt-based messaging
 * - Optimize for long-term consistency
 * - Adapt to emotional state
 * - Explainable decisions
 */
export class AIDecisionEngine {
  private model: any
  private promptVersion: string

  constructor(modelType: AIModelType = AI_MODELS.FLASH, promptVersion: string = PROMPT_VERSIONS.CORE_V1) {
    this.model = genAI.getGenerativeModel({ model: modelType })
    this.promptVersion = promptVersion
  }

  /**
   * Main decision-making function
   * Analyzes user context and returns actionable decision
   */
  async makeDecision(context: AIContext): Promise<{
    decision: AIDecision
    executionTimeMs: number
    modelUsed: AIModelType
  }> {
    const startTime = Date.now()
    
    try {
      const prompt = this.buildPrompt(context)
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse AI response into structured decision
      const decision = this.parseDecision(text, context)
      
      const executionTimeMs = Date.now() - startTime
      
      return {
        decision,
        executionTimeMs,
        modelUsed: AI_MODELS.FLASH, // TODO: Make dynamic based on context complexity
      }
    } catch (error) {
      console.error('AI decision error:', error)
      
      // Fallback to safe default decision
      return {
        decision: this.getDefaultDecision(context),
        executionTimeMs: Date.now() - startTime,
        modelUsed: AI_MODELS.FLASH,
      }
    }
  }

  /**
   * Build context-aware prompt for AI decision making
   */
  private buildPrompt(context: AIContext): string {
    const { user, emotion, streaks, habits, tasks, completions, analytics } = context
    
    // Calculate key metrics
    const todayCompletions = completions.filter(c => 
      c.date === new Date().toISOString().split('T')[0]
    )
    
    const recentEmotions = analytics
      .slice(0, 7)
      .map(a => a.emotion_state)
      .filter(Boolean)
    
    const missedDays = this.calculateMissedDays(streaks, completions)
    const consistencyScore = this.calculateConsistencyScore(completions, 7)
    
    return `
You are Anchor's AI decision engine. Your role is to make supportive, emotion-aware decisions for users building productive habits without guilt or burnout.

CONTEXT:
- User: ${user.email} (timezone: ${user.timezone})
- Current emotion: ${emotion?.emotion || 'unknown'} ${emotion?.notes ? `(notes: ${emotion.notes})` : ''}
- Recent emotions (7 days): [${recentEmotions.join(', ')}]
- Active streaks: ${streaks.filter(s => s.is_active).length}
- Today's completions: ${todayCompletions.length}
- Missed days in current streak: ${missedDays}
- 7-day consistency score: ${consistencyScore.toFixed(2)}

CURRENT STREAKS:
${streaks.map(s => `
- "${s.title}": ${s.current_count} days (longest: ${s.longest_count}), state: ${s.state}
`).join('')}

ACTIVE HABITS:
${habits.filter(h => h.is_active).map(h => `
- "${h.title}": difficulty ${h.difficulty_level}/5, ${h.estimated_minutes} min
`).join('')}

TODAY'S TASKS:
${tasks.filter(t => !t.is_completed).map(t => `
- "${t.title}": effort ${t.estimated_effort}/5
`).join('')}

DECISION PRINCIPLES:
1. NEVER use guilt, shame, or fear-based messaging
2. Optimize for long-term consistency over short-term intensity  
3. Adapt pressure based on emotional state:
   - Energized: Can handle normal/higher difficulty
   - Okay: Maintain current approach
   - Low: Reduce pressure, offer easier alternatives
   - Overwhelmed: Enter recovery mode, minimal pressure
4. Use streak states strategically:
   - Normal: Regular pressure and expectations
   - Recovery: Lower expectations, focus on showing up
   - Protected: Maintain streak even with minimal effort
5. Be supportive, not pushy

DECISION OPTIONS:
1. pressure_adjustment: Modify habit difficulty or task effort
2. streak_state_change: Change streak state (normal/recovery/protected)  
3. notification: Send supportive email
4. task_modification: Adjust today's task estimates
5. no_action: Sometimes the best action is no action

Please provide your decision in this JSON format:
{
  "action": "pressure_adjustment|notification|streak_state_change|task_modification|no_action",
  "reasoning": "Clear explanation of why this decision was made",
  "confidence": 0.85,
  "parameters": {
    "new_difficulty": 2,
    "new_streak_state": "recovery", 
    "notification_type": "gentle_encouragement",
    "notification_tone": "supportive",
    "task_modifications": [
      {"task_id": "uuid", "new_effort": 2}
    ]
  }
}

Make a decision now based on the current context:
`
  }

  /**
   * Parse AI response into structured decision object
   */
  private parseDecision(aiResponse: string, context: AIContext): AIDecision {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate and clean the decision
      return {
        action: parsed.action || 'no_action',
        reasoning: parsed.reasoning || 'Default decision due to parsing error',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        parameters: this.validateParameters(parsed.parameters, context)
      }
    } catch (error) {
      console.error('Failed to parse AI decision:', error)
      return this.getDefaultDecision(context)
    }
  }

  /**
   * Validate and sanitize decision parameters
   */
  private validateParameters(params: any, context: AIContext) {
    if (!params) return undefined

    const validated: any = {}

    if (params.new_difficulty && typeof params.new_difficulty === 'number') {
      validated.new_difficulty = Math.max(1, Math.min(5, Math.round(params.new_difficulty)))
    }

    if (params.new_streak_state && ['normal', 'recovery', 'protected'].includes(params.new_streak_state)) {
      validated.new_streak_state = params.new_streak_state
    }

    if (params.notification_type && typeof params.notification_type === 'string') {
      validated.notification_type = params.notification_type
    }

    if (params.notification_tone && ['supportive', 'encouraging', 'gentle'].includes(params.notification_tone)) {
      validated.notification_tone = params.notification_tone
    }

    if (Array.isArray(params.task_modifications)) {
      validated.task_modifications = params.task_modifications
        .filter((mod: any) => mod.task_id && typeof mod.new_effort === 'number')
        .map((mod: any) => ({
          task_id: mod.task_id,
          new_effort: Math.max(1, Math.min(5, Math.round(mod.new_effort)))
        }))
    }

    return Object.keys(validated).length > 0 ? validated : undefined
  }

  /**
   * Generate a safe default decision when AI fails
   */
  private getDefaultDecision(context: AIContext): AIDecision {
    const { emotion, streaks } = context
    
    // Simple rule-based fallback
    if (emotion?.emotion === 'overwhelmed') {
      return {
        action: 'streak_state_change',
        reasoning: 'User is overwhelmed, switching to recovery mode for reduced pressure',
        confidence: 0.8,
        parameters: {
          new_streak_state: 'recovery' as StreakState
        }
      }
    }
    
    if (emotion?.emotion === 'low') {
      return {
        action: 'pressure_adjustment',
        reasoning: 'User is feeling low, reducing difficulty to maintain engagement',
        confidence: 0.7,
        parameters: {
          new_difficulty: 2
        }
      }
    }

    return {
      action: 'no_action',
      reasoning: 'Maintaining current approach - no changes needed',
      confidence: 0.6
    }
  }

  /**
   * Calculate days missed in current streak
   */
  private calculateMissedDays(streaks: any[], completions: any[]): number {
    if (streaks.length === 0) return 0
    
    const activeStreak = streaks.find(s => s.is_active)
    if (!activeStreak) return 0
    
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const hasYesterdayCompletion = completions.some(c => 
      c.streak_id === activeStreak.id && c.date === yesterdayStr
    )
    
    return hasYesterdayCompletion ? 0 : 1
  }

  /**
   * Calculate consistency score over given days
   */
  private calculateConsistencyScore(completions: any[], days: number): number {
    if (days === 0) return 0
    
    const today = new Date()
    const completionDates = new Set()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      if (completions.some(c => c.date === dateStr)) {
        completionDates.add(dateStr)
      }
    }
    
    return completionDates.size / days
  }

  /**
   * Get current prompt version for observability
   */
  getPromptVersion(): string {
    return this.promptVersion
  }
}