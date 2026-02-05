import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'
import { z } from 'zod'

const streakSchema = z.object({
  title: z.string().min(1, 'Streak title is required').max(200),
  description: z.string().max(500).optional(),
})

// POST /api/streaks - Create a new streak
export const POST = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const body = await request.json()
    const { title, description } = streakSchema.parse(body)
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('streaks')
      .insert({
        user_id: context.userId,
        title,
        description,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Streak created successfully',
      data,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create streak error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

// GET /api/streaks - Get user's streaks
export const GET = withAuth(async function(
  request: NextRequest,
  context: AuthContext
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    
    let query = supabase
      .from('streaks')
      .select('*')
      .eq('user_id', context.userId)
      .order('created_at', { ascending: false })

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
    console.error('Get streaks error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})