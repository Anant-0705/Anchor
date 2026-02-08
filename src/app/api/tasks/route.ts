import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'
import { z } from 'zod'

const taskSchema = z.object({
  habit_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(500).optional(),
  estimated_effort: z.number().int().min(1).max(5).default(3),
  due_date: z.string().optional(),
})

// POST /api/tasks - Create a new task
export const POST = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const body = await request.json()
    const { habit_id, title, description, estimated_effort, due_date } = taskSchema.parse(body)
    
    const supabase = await createClient()
    
    // If habit_id provided, verify it belongs to user
    if (habit_id) {
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .select('id')
        .eq('id', habit_id)
        .eq('user_id', context.userId)
        .single()

      if (habitError || !habit) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
      }
    }
    
    const { data, error } = await (supabase
      .from('tasks') as any)
      .insert({
        user_id: context.userId,
        habit_id,
        title,
        description,
        estimated_effort,
        due_date,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Task created successfully',
      data,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// GET /api/tasks - Get user's tasks
export const GET = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const habitId = searchParams.get('habit_id')
    const completedOnly = searchParams.get('completed') === 'true'
    const pendingOnly = searchParams.get('pending') === 'true'
    const today = searchParams.get('today') === 'true'
    
    let query = supabase
      .from('tasks')
      .select(`
        *,
        habits (
          title,
          streak_id
        )
      `)
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })

    if (habitId) {
      query = query.eq('habit_id', habitId)
    }

    if (completedOnly) {
      query = query.eq('is_completed', true)
    }

    if (pendingOnly) {
      query = query.eq('is_completed', false)
    }

    if (today) {
      const todayStr = new Date().toISOString().split('T')[0]
      query = query.or(`due_date.eq.${todayStr},due_date.is.null`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      data,
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})