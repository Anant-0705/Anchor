'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, User, Bell, Shield, Clock, Moon, 
  Save, Check, LogOut, Trash2
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  full_name: string
  email: string
  timezone: string
  default_checkin_time: string
  notification_preferences: {
    email_reminders: boolean
    streak_alerts: boolean
    ai_suggestions: boolean
    weekly_summary: boolean
  }
  created_at: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'account'>('profile')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to load profile')
      const result = await response.json()
      setProfile(result.data)
    } catch (err) {
      setError('Failed to load profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (!response.ok) throw new Error('Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const updateNotificationPref = (key: keyof UserProfile['notification_preferences'], value: boolean) => {
    if (!profile) return
    setProfile({
      ...profile,
      notification_preferences: {
        ...profile.notification_preferences,
        [key]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'account', label: 'Account', icon: Shield },
  ] as const

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-gray-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-black">Settings</h1>
          <p className="text-gray-500">Manage your account and preferences</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {profile && (
        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.div variants={item} className="w-48 flex-shrink-0">
            <GlassCard className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </GlassCard>
          </motion.div>

          {/* Content */}
          <motion.div variants={item} className="flex-1">
            {activeTab === 'profile' && (
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Profile Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                      onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Phoenix">Arizona (MST)</option>
                      <option value="America/Anchorage">Alaska</option>
                      <option value="Pacific/Honolulu">Hawaii</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="checkinTime">Default Check-in Time</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <Input
                        id="checkinTime"
                        type="time"
                        value={profile.default_checkin_time || '08:00'}
                        onChange={(e) => setProfile({ ...profile, default_checkin_time: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">When to prompt for your daily mood check-in</p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? (
                        'Saving...'
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === 'notifications' && (
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    { key: 'email_reminders', label: 'Email Reminders', desc: 'Receive daily check-in reminders' },
                    { key: 'streak_alerts', label: 'Streak Alerts', desc: 'Get notified when streaks are at risk' },
                    { key: 'ai_suggestions', label: 'AI Suggestions', desc: 'Receive AI-powered recommendations' },
                    { key: 'weekly_summary', label: 'Weekly Summary', desc: 'Get a weekly progress report' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-black">{item.label}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                      <button
                        onClick={() => updateNotificationPref(
                          item.key as keyof UserProfile['notification_preferences'],
                          !profile.notification_preferences?.[item.key as keyof UserProfile['notification_preferences']]
                        )}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          profile.notification_preferences?.[item.key as keyof UserProfile['notification_preferences']]
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            profile.notification_preferences?.[item.key as keyof UserProfile['notification_preferences']]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4">
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? (
                        'Saving...'
                      ) : saved ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Account Details
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-black">Member Since</div>
                        <div className="text-sm text-gray-500">
                          {new Date(profile.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-black">Account ID</div>
                        <div className="text-sm text-gray-500 font-mono">{profile.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-black mb-6">Actions</h2>

                  <div className="space-y-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <LogOut className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <div className="font-medium text-black">Sign Out</div>
                          <div className="text-sm text-gray-500">Log out of your account</div>
                        </div>
                      </div>
                      <span className="text-gray-400 group-hover:text-gray-600">→</span>
                    </button>

                    <button
                      className="w-full flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors group"
                      onClick={() => alert('This feature is not yet implemented. Please contact support.')}
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <div className="text-left">
                          <div className="font-medium text-red-700">Delete Account</div>
                          <div className="text-sm text-red-500">Permanently delete your account and data</div>
                        </div>
                      </div>
                      <span className="text-red-400 group-hover:text-red-600">→</span>
                    </button>
                  </div>
                </GlassCard>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}