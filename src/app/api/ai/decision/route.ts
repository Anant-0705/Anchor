import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'
import { AIService } from '@/lib/ai/ai-service'

// POST /api/ai/decision - Trigger AI decision for user
export const POST = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const aiService = new AIService()
    
    const result = await aiService.processUserDecision(context.userId)
    
    return NextResponse.json({
      message: 'AI decision processed',
      data: {
        action: result.decision.action,
        reasoning: result.decision.reasoning,
        confidence: result.decision.confidence,
        executed: result.executed,
        decision_log_id: result.decisionLogId,
      },
    })
  } catch (error) {
    console.error('AI decision API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI decision' },
      { status: 500 }
    )
  }
})

// GET /api/ai/decisions - Get user's AI decision history
export const GET = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const decisionType = searchParams.get('type')
    
    const supabase = await createClient()
    
    let query = supabase
      .from('ai_decisions')
      .select('*')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (decisionType) {
      query = query.eq('decision_type', decisionType)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.error('Get AI decisions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})