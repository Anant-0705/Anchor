import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'

interface RouteParams {
  params: {
    streakId: string
  }
}

// GET /api/streaks/[streakId] - Get a specific streak
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(async function(req: NextRequest, context: AuthContext) {
    try {
      const { streakId } = params
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('id', streakId)
        .eq('user_id', context.userId)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: 'Streak not found' }, { status: 404 })
      }

      return NextResponse.json({
        data,
      })
    } catch (error) {
      console.error('Get streak error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })(request)
}