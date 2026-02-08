import { createClient } from '@/lib/auth/server'
import { AIDecisionEngine, AI_MODELS } from './decision-engine'
import { AIContext, AIDecision, AIDecisionLog } from '@/types'

/**
 * AI Service Layer
 * Orchestrates AI decisions and manages observability logging
 */
export class AIService {
  private decisionEngine: AIDecisionEngine
  private supabase: any

  constructor() {
    this.decisionEngine = new AIDecisionEngine()
    this.supabase = null
  }

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  /**
   * Main entry point for AI decisions
   * Gathers context, makes decision, logs everything, and executes
   */
  async processUserDecision(userId: string): Promise<{
    decision: AIDecision
    executed: boolean
    decisionLogId: string
  }> {
    try {
      // 1. Gather comprehensive context
      const context = await this.gatherUserContext(userId)
      
      // 2. Make AI decision
      const { decision, executionTimeMs, modelUsed } = await this.decisionEngine.makeDecision(context)
      
      // 3. Log decision for observability
      const decisionLogId = await this.logDecision(userId, context, decision, executionTimeMs, modelUsed)
      
      // 4. Execute the decision
      const executed = await this.executeDecision(userId, decision, decisionLogId)
      
      return {
        decision,
        executed,
        decisionLogId
      }
    } catch (error) {
      console.error('AI service error:', error)
      throw error
    }
  }

  /**
   * Gather all relevant user context for AI decision making
   */
  private async gatherUserContext(userId: string): Promise<AIContext> {
    const [
      user,
      emotion,
      streaks,
      habits,
      tasks,
      completions,
      analytics
    ] = await Promise.all([
      this.getUserData(userId),
      this.getTodayEmotion(userId),
      this.getActiveStreaks(userId),
      this.getActiveHabits(userId),
      this.getTodayTasks(userId),
      this.getRecentCompletions(userId, 14), // Last 2 weeks
      this.getRecentAnalytics(userId, 7) // Last week
    ])

    return {
      user,
      emotion,
      streaks,
      habits,
      tasks,
      completions,
      analytics
    }
  }

  /**
   * Execute AI decisions by updating database and triggering actions
   */
  private async executeDecision(userId: string, decision: AIDecision, decisionLogId: string): Promise<boolean> {
    try {
      const executedAt = new Date().toISOString()
      let outcome: any = { success: true, actions: [] }

      switch (decision.action) {
        case 'pressure_adjustment':
          if (decision.parameters?.new_difficulty) {
            await this.adjustHabitDifficulty(userId, decision.parameters.new_difficulty)
            outcome.actions.push('difficulty_adjusted')
          }
          break

        case 'streak_state_change':
          if (decision.parameters?.new_streak_state) {
            await this.updateStreakState(userId, decision.parameters.new_streak_state)
            outcome.actions.push('streak_state_changed')
          }
          break

        case 'notification':
          if (decision.parameters?.notification_type) {
            const notificationId = await this.sendNotification(userId, decision, decisionLogId)
            outcome.actions.push(`notification_sent:${notificationId}`)
          }
          break

        case 'task_modification':
          if (decision.parameters?.task_modifications) {
            await this.modifyTasks(userId, decision.parameters.task_modifications)
            outcome.actions.push('tasks_modified')
          }
          break

        case 'no_action':
          outcome.actions.push('no_action_taken')
          break
      }

      // Update decision log with outcome
      const supabase = await this.getSupabaseClient()
      await supabase
        .from('ai_decisions')
        .update({
          executed_at: executedAt,
          outcome
        })
        .eq('id', decisionLogId)

      return true
    } catch (error) {
      console.error('Failed to execute AI decision:', error)
      
      // Log failure
      const supabase = await this.getSupabaseClient()
      await supabase
        .from('ai_decisions')
        .update({
          executed_at: new Date().toISOString(),
          outcome: { success: false, error: String(error) }
        })
        .eq('id', decisionLogId)

      return false
    }
  }

  /**
   * Log AI decision for observability and evaluation
   */
  private async logDecision(
    userId: string,
    context: AIContext,
    decision: AIDecision,
    executionTimeMs: number,
    modelUsed: string
  ): Promise<string> {
    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('ai_decisions')
      .insert({
        user_id: userId,
        decision_type: decision.action,
        context: context,
        decision: decision,
        prompt_version: this.decisionEngine.getPromptVersion(),
        model_used: modelUsed,
        execution_time_ms: executionTimeMs,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to log AI decision:', error)
      throw error
    }

    return data.id
  }

  // Context gathering methods
  private async getUserData(userId: string) {
    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  private async getTodayEmotion(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const supabase = await this.getSupabaseClient()
    const { data } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    return data || null
  }

  private async getActiveStreaks(userId: string) {
    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private async getActiveHabits(userId: string) {
    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  private async getTodayTasks(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .or(`due_date.is.null,due_date.eq.${today}`)
      .eq('is_completed', false)

    if (error) throw error
    return data || []
  }

  private async getRecentCompletions(userId: string, days: number) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  private async getRecentAnalytics(userId: string, days: number) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Decision execution methods
  private async adjustHabitDifficulty(userId: string, newDifficulty: number) {
    const supabase = await this.getSupabaseClient()
    const { error } = await supabase
      .from('habits')
      .update({ difficulty_level: newDifficulty })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
  }

  private async updateStreakState(userId: string, newState: string) {
    const supabase = await this.getSupabaseClient()
    const { error } = await supabase
      .from('streaks')
      .update({ state: newState })
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) throw error
  }

  private async sendNotification(userId: string, decision: AIDecision, decisionLogId: string): Promise<string> {
    // Generate notification content based on decision
    const { subject, content } = this.generateNotificationContent(decision)

    const supabase = await this.getSupabaseClient()
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ai_decision_id: decisionLogId,
        type: decision.parameters?.notification_type || 'ai_decision',
        subject,
        content,
      })
      .select('id')
      .single()

    if (error) throw error
    
    // TODO: Send actual email via email service
    
    return data.id
  }

  private async modifyTasks(userId: string, modifications: Array<{ task_id: string; new_effort: number }>) {
    const supabase = await this.getSupabaseClient()
    for (const mod of modifications) {
      await supabase
        .from('tasks')
        .update({ estimated_effort: mod.new_effort })
        .eq('id', mod.task_id)
        .eq('user_id', userId)
    }
  }

  private generateNotificationContent(decision: AIDecision): { subject: string; content: string } {
    const tone = decision.parameters?.notification_tone || 'supportive'
    
    // Simple content generation - in production, this could be more sophisticated
    const subjects: Record<string, string> = {
      supportive: "You're doing great - here's a gentle nudge",
      encouraging: "Keep up the momentum!",
      gentle: "A friendly reminder from Anchor"
    }

    const contents: Record<string, string> = {
      supportive: `Hi there,\n\n${decision.reasoning}\n\nRemember, progress isn't about perfection - it's about showing up consistently. You've got this!\n\nBest,\nThe Anchor Team`,
      encouraging: `Hello!\n\n${decision.reasoning}\n\nYou're building something meaningful. Every small step counts!\n\nKeep going,\nAnchor`,
      gentle: `Hi,\n\n${decision.reasoning}\n\nTake it easy on yourself. We're here to support your journey.\n\nWith care,\nAnchor`
    }

    return {
      subject: subjects[tone] || subjects.supportive,
      content: contents[tone] || contents.supportive
    }
  }
}