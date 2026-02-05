'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/ui/glass-card'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh p-4">
        <GlassCard className="max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600 mb-8">
            We've sent a confirmation link to <span className="font-medium text-gray-900">{email}</span>.
            <br />Click it to activate your account.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-gradient-mesh relative order-last lg:order-first">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 mb-8"
          >
            <Link href="/" className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h1>
            <p className="mt-2 text-gray-600">Start your journey to guilt-free productivity</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSignUp} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName" className='text-black'>Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="rounded-lg h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className='text-black'>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="rounded-lg h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all text-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className='text-black'>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  className="rounded-lg h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all text-black"
                />
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">
                Already have an account?{' '}
              </span>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-blue-600 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-600 opacity-90"></div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8">Join thousands of users building better habits</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-lg">Identity-Based Growth</h3>
                  <p className="text-blue-100">Focus on becoming the person you want to be.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-lg">Adaptive Support</h3>
                  <p className="text-blue-100">AI that adjusts to your emotional bandwidth.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-lg">Community of Doers</h3>
                  <p className="text-blue-100">Join a community focused on sustainable progress.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}