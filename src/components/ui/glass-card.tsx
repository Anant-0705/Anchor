'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
}

export function GlassCard({ 
  children, 
  className, 
  hoverEffect = true,
  ...props 
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5, scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "glass-card rounded-xl p-6 transition-all duration-300",
        hoverEffect && "hover:shadow-2xl hover:border-white/40",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
