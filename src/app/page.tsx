'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Target, Heart, Sprout, ArrowRight, CheckCircle2, Sparkles, TrendingUp, Shield, Zap } from 'lucide-react'
import { useRef } from 'react'

export default function Home() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  }

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "loop" as const
    }
  }

  return (
    <div className="min-h-screen bg-gradient-mesh overflow-hidden selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed w-full z-50 glass border-b-0 top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-2"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                A
              </motion.div>
              <h1 className="text-2xl font-bold tracking-tight text-black">Anchor</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center space-x-4"
            >
              <Link href="/login">
                <Button variant="ghost" className="text-base font-medium text-black hover:bg-black/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main ref={heroRef} className="pt-32 pb-20 relative">
        <motion.div style={{ opacity, scale }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto relative z-10"
          >
            <motion.div 
              variants={item} 
              className="mb-6 inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md rounded-full px-5 py-2 border border-white/30 shadow-lg"
            >
              <motion.span 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-2 w-2 rounded-full bg-blue-500"
              />
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">New: Identity-Based Streaks</span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-black mb-8 leading-[1.05]"
            >
              Build habits that <br />
              <motion.span 
                className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 inline-block"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: '200% 200%' }}
              >
                stick without the guilt
              </motion.span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
            >
              The emotion-aware productivity app that adapts to your mood.
              Build routines around <span className="font-semibold text-gray-800">who you want to be</span>, not just what you do.
            </motion.p>

            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-full bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white hover:border-gray-400 transition-all text-black font-semibold">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Floating stats badges */}
            <motion.div
              variants={item}
              className="flex flex-wrap justify-center gap-6 mb-16"
            >
              <motion.div
                animate={floatingAnimation}
                className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-6 py-3 border border-white/40 shadow-lg"
              >
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">10k+ Active Users</span>
              </motion.div>
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }
                }}
                className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-6 py-3 border border-white/40 shadow-lg"
              >
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-semibold text-gray-700">94% Success Rate</span>
              </motion.div>
              <motion.div
                animate={{
                  y: [0, -18, 0],
                  transition: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }
                }}
                className="flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-6 py-3 border border-white/40 shadow-lg"
              >
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Privacy First</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
          >
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="h-full"
            >
              <GlassCard className="bg-white/50 backdrop-blur-md border-white/40 h-full hover:shadow-2xl transition-shadow duration-300">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-linear-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-lg"
                >
                  <Target size={28} />
                </motion.div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  Identity-Based Streaks
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Build habits around who you want to be. Shift your focus from "running 5k" to "becoming a runner".
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="h-full"
            >
              <GlassCard className="bg-white/50 backdrop-blur-md border-white/40 h-full hover:shadow-2xl transition-shadow duration-300">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-linear-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 shadow-lg"
                >
                  <Heart size={28} />
                </motion.div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  Emotion-Aware AI
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Our AI adapts to your emotional state. Feeling low? We'll gentle the pace. Energized? We'll help you push.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="h-full"
            >
              <GlassCard className="bg-white/50 backdrop-blur-md border-white/40 h-full hover:shadow-2xl transition-shadow duration-300">
                <motion.div 
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-linear-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mb-6 text-teal-600 shadow-lg"
                >
                  <Sprout size={28} />
                </motion.div>
                <h3 className="text-2xl font-bold text-black mb-4">
                  No-Guilt Growth
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Recovery modes and protected streaks ensure that a bad day doesn't ruin your long-term progress.
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Trust Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 text-center border-t border-gray-200/50 pt-16"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-10"
            >
              Built for mental health-friendly productivity
            </motion.p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-gray-600 font-medium">
              {[
                { icon: CheckCircle2, text: "Privacy-first Design" },
                { icon: CheckCircle2, text: "AI-Powered Insights" },
                { icon: CheckCircle2, text: "Zero Guilt Guarantee" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3"
                >
                  <item.icon className="w-6 h-6 text-blue-500" />
                  <span className="text-lg">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 mb-16"
          >
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-12 text-center shadow-2xl">
              <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,transparent,black)]"></div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"
              />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Ready to transform your habits?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of people building better lives, one mindful habit at a time.
                </p>
                <Link href="/register">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button size="lg" variant="secondary" className="h-14 px-10 text-lg rounded-full bg-white text-blue-700 hover:bg-blue-50 font-bold shadow-xl">
                      Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}