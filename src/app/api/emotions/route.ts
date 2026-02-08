import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'
import { z } from 'zod'
import { EmotionState } from '@/types'

const emotionCheckinSchema = z.object({
  emotion: z.enum(['energized', 'okay', 'low', 'overwhelmed']),
  notes: z.string().optional(),
})

// POST /api/emotions - Create daily emotion check-in
export const POST = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const body = await request.json()
    const { emotion, notes } = emotionCheckinSchema.parse(body)
    
    const supabase = await createClient()
    
    // Check if user already has check-in for today
    const today = new Date().toISOString().split('T')[0]
    const { data: existing } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', context.userId)
      .eq('date', today)
      .single()

    if (existing) {
      // Update existing check-in  
      const { data, error } = await supabase
        .from('emotion_checkins')
        .update({ emotion, notes })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        message: 'Emotion check-in updated',
        data,
      })
    } else {
      // Create new check-in
      const { data, error } = await supabase
        .from('emotion_checkins')
        .insert({
          user_id: context.userId,
          emotion,
          notes,
          date: today,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        message: 'Emotion check-in completed',
        data,
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Emotion check-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// GET /api/emotions - Get user's emotion check-ins
export const GET = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    
    const { data, error } = await supabase
      .from('emotion_checkins')
      .select('*')
      .eq('user_id', context.userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.error('Get emotions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})