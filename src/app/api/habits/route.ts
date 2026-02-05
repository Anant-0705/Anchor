import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'
import { z } from 'zod'

const habitSchema = z.object({
  streak_id: z.string().uuid(),
  title: z.string().min(1, 'Habit title is required').max(200),
  description: z.string().max(500).optional(),
  difficulty_level: z.number().int().min(1).max(5).default(1),
  estimated_minutes: z.number().int().min(1).max(480).default(15),
})

const completeHabitSchema = z.object({
  difficulty_completed: z.number().int().min(1).max(5),
  notes: z.string().max(500).optional(),
})

// POST /api/habits - Create a new habit
export const POST = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const body = await request.json()
    const { streak_id, title, description, difficulty_level, estimated_minutes } = habitSchema.parse(body)
    
    const supabase = await createClient()
    
    // Verify streak belongs to user
    const { data: streak, error: streakError } = await supabase
      .from('streaks')
      .select('id')
      .eq('id', streak_id)
      .eq('user_id', context.userId)
      .single()

    if (streakError || !streak) {
      return NextResponse.json({ error: 'Streak not found' }, { status: 404 })
    }
    
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: context.userId,
        streak_id,
        title,
        description,
        difficulty_level,
        estimated_minutes,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Habit created successfully',
      data,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create habit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// GET /api/habits - Get user's habits
export const GET = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const streakId = searchParams.get('streak_id')
    const activeOnly = searchParams.get('active') === 'true'
    
    let query = supabase
      .from('habits')
      .select(`
        *,
        streaks (
          title,
          state
        )
      `)
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })

    if (streakId) {
      query = query.eq('streak_id', streakId)
    }

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.error('Get habits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})