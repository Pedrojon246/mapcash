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
  food: '#FF9500',
  transport: '#007AFF',
  housing: '#5856D6',
  health: '#FF2D55',
  education: '#34C759',
  entertainment: '#AF52DE',
  shopping: '#FF3B30',
  travel: '#5AC8FA',
  salary: '#34C759',
  freelance: '#30B0C7',
  investment: '#007AFF',
  other: '#8E8E93',
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍽️',
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

export const GOAL_COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#AF52DE', '#FF2D55', '#5AC8FA', '#5856D6',
]

export const GOAL_EMOJIS = [
  '✈️', '🏠', '🚗', '💍', '📱', '🎓',
  '💰', '🏖️', '🎯', '🌟', '❤️', '🎁',
]
