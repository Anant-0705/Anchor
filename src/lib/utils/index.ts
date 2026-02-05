import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInDays = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  
  return formatDate(date)
}

// Emotion utilities
export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    energized: 'bg-green-100 text-green-800 border-green-200',
    okay: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    overwhelmed: 'bg-red-100 text-red-800 border-red-200',
  }
  return colors[emotion] || colors.okay
}

export function getEmotionEmoji(emotion: string): string {
  const emojis: Record<string, string> = {
    energized: '⚡',
    okay: '😊',
    low: '😔',
    overwhelmed: '😰',
  }
  return emojis[emotion] || '😊'
}

// Streak utilities
export function getStreakStateColor(state: string): string {
  const colors: Record<string, string> = {
    normal: 'bg-green-100 text-green-800',
    recovery: 'bg-yellow-100 text-yellow-800', 
    protected: 'bg-blue-100 text-blue-800',
  }
  return colors[state] || colors.normal
}

export function getStreakStateLabel(state: string): string {
  const labels: Record<string, string> = {
    normal: 'Normal',
    recovery: 'Recovery Mode',
    protected: 'Protected',
  }
  return labels[state] || 'Normal'
}

// Difficulty utilities
export function getDifficultyColor(level: number): string {
  if (level <= 2) return 'bg-green-100 text-green-800'
  if (level <= 3) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export function getDifficultyLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Very Easy',
    2: 'Easy',
    3: 'Medium',
    4: 'Hard',
    5: 'Very Hard',
  }
  return labels[level] || 'Medium'
}

// Progress utilities
export function calculateStreakProgress(currentCount: number, targetCount: number = 30): number {
  return Math.min((currentCount / targetCount) * 100, 100)
}

export function getConsistencyLabel(percentage: number): string {
  if (percentage >= 90) return 'Excellent'
  if (percentage >= 70) return 'Good'
  if (percentage >= 50) return 'Fair'
  return 'Needs Improvement'
}

export function getConsistencyColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600'
  if (percentage >= 70) return 'text-blue-600'
  if (percentage >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

// Time utilities
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

// API utilities
export async function fetcher(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export function handleApiError(error: any): string {
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Local storage utilities
export function getLocalStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch {
    // Ignore errors
  }
}

// Analytics utilities
export function calculateWeeklyTrend(analytics: Array<{ date: string; total_habits_completed: number }>): number {
  if (analytics.length < 2) return 0
  
  const sortedAnalytics = analytics.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const firstHalf = sortedAnalytics.slice(0, Math.floor(sortedAnalytics.length / 2))
  const secondHalf = sortedAnalytics.slice(Math.floor(sortedAnalytics.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, a) => sum + a.total_habits_completed, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, a) => sum + a.total_habits_completed, 0) / secondHalf.length
  
  return secondAvg - firstAvg
}