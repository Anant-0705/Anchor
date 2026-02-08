import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { data: profile, error: profileError } = await (supabase
      .from('users') as any)
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    // Return default notification preferences if not set
    const defaultNotifications = {
      email_reminders: true,
      streak_alerts: true,
      ai_suggestions: true,
      weekly_summary: true
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        default_checkin_time: profile.default_checkin_time || '08:00',
        notification_preferences: profile.notification_preferences || defaultNotifications,
        created_at: profile.created_at
      }
    })
  } catch (error) {
    console.error('Settings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { full_name, timezone, default_checkin_time, notification_preferences } = body

    const { data: profile, error: updateError } = await (supabase
      .from('users') as any)
      .update({
        full_name,
        timezone,
        default_checkin_time,
        notification_preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}