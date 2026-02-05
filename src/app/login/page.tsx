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
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-gradient-mesh relative">
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-600">Sign in to your emotion-aware companion</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className='text-black'>Password</Label>
                  <Link href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 text-black">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="rounded-lg h-11 bg-white/50 backdrop-blur-sm border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all text-black"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-base shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">
                Don't have an account?{' '}
              </span>
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-500 font-medium hover:underline"
              >
                Sign up for free
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-gray-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30"></div>

        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 text-4xl font-bold">
              A
            </div>
            <h2 className="text-4xl font-bold mb-6">Productivity without the burnout</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              "Anchor has completely changed how I approach my daily habits. It feels like having a supportive friend rather than a strict boss."
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}