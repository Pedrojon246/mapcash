import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(dateStr: string, locale = 'pt-BR'): string {
  const date = parseISO(dateStr)
  const dateLocale = locale === 'pt-BR' ? ptBR : enUS
  if (isToday(date)) return locale === 'pt-BR' ? 'Hoje' : 'Today'
  if (isYesterday(date)) return locale === 'pt-BR' ? 'Ontem' : 'Yesterday'
  return format(date, 'dd MMM', { locale: dateLocale })
}

export function formatMonth(dateStr: string, locale = 'pt-BR'): string {
  const dateLocale = locale === 'pt-BR' ? ptBR : enUS
  return format(parseISO(dateStr + '-01'), 'MMMM yyyy', { locale: dateLocale })
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

export const CATEGORY_COLORS: Record<string, string> = {
  food_home: '#34C759',
  food_out: '#FF9500',
  transport: '#007AFF',
  housing: '#5856D6',
  health: '#FF2D55',
  education: '#30B0C7',
  entertainment: '#AF52DE',
  shopping: '#FF6B35',
  travel: '#5AC8FA',
  salary: '#34C759',
  freelance: '#007AFF',
  investment: '#5856D6',
  other: '#8E8E93',
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  food_home: '🛒',
  food_out: '🍔',
  transport: '🚗',
  housing: '🏠',
  health: '💊',
  education: '📚',
  entertainment: '🎮',
  shopping: '🛍️',
  travel: '✈️',
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  other: '📦',
}

// Categories that are considered "cuttable" (non-essential)
export const CUTTABLE_CATEGORIES = ['food_out', 'entertainment', 'shopping', 'travel']

// Categories that are essential
export const ESSENTIAL_CATEGORIES = ['food_home', 'transport', 'housing', 'health', 'education']

export const GOAL_COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#AF52DE', '#FF2D55', '#5AC8FA', '#5856D6',
]

export const GOAL_EMOJIS = [
  '✈️', '🏠', '🚗', '💍', '📱', '🎓',
  '💰', '🏖️', '🎯', '🌟', '❤️', '🎁',
]
