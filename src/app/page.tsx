'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Target, Heart, Sprout, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-mesh overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass border-b-0 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Anchor</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link href="/login">
                <Button variant="ghost" className="text-base font-medium text-black">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="font-semibold shadow-lg shadow-blue-500/20">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={item} className="mb-6 inline-flex items-center space-x-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-600">New: Identity-Based Streaks</span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-6xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-[1.1]"
            >
              Build habits that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                stick without the guilt
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              The emotion-aware productivity app that adapts to your mood.
              Build routines around who you want to be, not just what you do.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24"
            >
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all scale-100 hover:scale-105">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full bg-white/50 border-gray-200 hover:bg-black transition-all text-black">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <GlassCard className="bg-white/40">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Identity-Based Streaks
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Build habits around who you want to be. Shift your focus from "running 5k" to "becoming a runner".
              </p>
            </GlassCard>

            <GlassCard className="bg-white/40">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Emotion-Aware AI
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI adapts to your emotional state. Feeling low? We'll gentle the pace. Energized? We'll help you push.
              </p>
            </GlassCard>

            <GlassCard className="bg-white/40">
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 text-teal-600">
                <Sprout size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No-Guilt Growth
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Recovery modes and protected streaks ensure that a bad day doesn't ruin your long-term progress.
              </p>
            </GlassCard>
          </motion.div>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32 text-center border-t border-gray-200/50 pt-16"
          >
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-8">
              Built for mental health-friendly productivity
            </p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>Privacy-first Design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>AI-Powered Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                <span>Zero Guilt Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}