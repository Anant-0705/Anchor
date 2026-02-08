import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'
import { z } from 'zod'

const completeHabitSchema = z.object({
  difficulty_completed: z.number().int().min(1).max(5),
  notes: z.string().max(500).optional(),
})

interface RouteParams {
  params: Promise<{
    habitId: string
  }>
}

// POST /api/habits/[habitId]/complete - Complete a habit for today
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { habitId } = await params
    const body = await request.json()
    const { difficulty_completed, notes } = completeHabitSchema.parse(body)
    
    // Verify habit belongs to user
    const { data: habit, error: habitError } = await supabase
      .from('habits')
      .select('*, streaks(id)')
      .eq('id', habitId)
      .eq('user_id', user.id)
      .single()

      if (habitError || !habit) {
        return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
      }

      const today = new Date().toISOString().split('T')[0]
      
      // Check if already completed today
      const { data: existing } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .eq('date', today)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'Habit already completed today' }, { status: 409 })
      }

      // Create completion record
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          user_id: user.id,
          habit_id: habitId,
          streak_id: habit.streaks!.id,
          date: today,
          difficulty_completed,
          notes,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Update streak will be handled by database trigger
      
      return NextResponse.json({
        message: 'Habit completed successfully',
        data,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        )
      }

      console.error('Complete habit error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
}