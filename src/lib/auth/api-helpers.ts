import { createClient } from '@/lib/auth/server'
import { NextRequest, NextResponse } from 'next/server'

export interface AuthContext {
  user: any
  userId: string
}

// Higher-order function to protect API routes
export function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async function(request: NextRequest) {
    try {
      const supabase = await createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Ensure user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        // Create user if doesn't exist
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name,
            last_seen_at: new Date().toISOString()
          })

        if (createError) {
          console.error('Failed to create user:', createError)
          return NextResponse.json(
            { error: 'Failed to initialize user' },
            { status: 500 }
          )
        }
      } else {
        // Update last seen
        await supabase
          .from('users')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', user.id)
      }

      const context: AuthContext = {
        user,
        userId: user.id
      }

      return await handler(request, context)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

// Helper to get user from request
export async function getUser(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

// Helper to validate user owns resource
export async function validateUserOwnership(userId: string, resourceUserId: string) {
  return userId === resourceUserId
}