import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthContext } from '@/lib/auth/api-helpers'
import { createClient } from '@/lib/auth/server'

interface RouteParams {
  params: Promise<{
    taskId: string
  }>
}

// POST /api/tasks/[taskId]/complete - Complete a task
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(async function(req: NextRequest, context: AuthContext) {
    try {
      const { taskId } = await params
      const supabase = await createClient()
      
      // Verify task belongs to user
      const { data: task, error: taskError } = await (supabase
        .from('tasks') as any)
        .select('*')
        .eq('id', taskId)
        .eq('user_id', context.userId)
        .single()

      if (taskError || !task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }

      if (task.is_completed) {
        return NextResponse.json({ error: 'Task already completed' }, { status: 409 })
      }

      // Mark task as completed
      const { data, error } = await (supabase
        .from('tasks') as any)
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      return NextResponse.json({
        message: 'Task completed successfully',
        data,
      })
    } catch (error) {
      console.error('Complete task error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })(request)
}