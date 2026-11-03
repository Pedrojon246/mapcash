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

/** Safe [start, nextStart) range for a 'yyyy-MM' month — never builds invalid dates like 11-31 */
export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number)
  const ny = m === 12 ? y + 1 : y
  const nm = m === 12 ? 1 : m + 1
  const pad = (n: number) => String(n).padStart(2, '0')
  return { start: `${y}-${pad(m)}-01`, end: `${ny}-${pad(nm)}-01` }
}

export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
}

// Neutral, tonal ramp (premium look): no rainbow. Used only in charts/bars.
export const CATEGORY_COLORS: Record<string, string> = {
  food_home: '#B8B8BD',
  food_out: '#A4A4A9',
  transport: '#909096',
  housing: '#7D7D83',
  health: '#6C6C72',
  education: '#C8C8CC',
  entertainment: '#58585E',
  shopping: '#9A9AA0',
  travel: '#85858B',
  salary: '#30D158',
  freelance: '#30D158',
  investment: '#30D158',
  other: '#707076',
}

// Kept for backwards compatibility with text-only contexts (no emoji in UI)
export const CATEGORY_EMOJIS: Record<string, string> = {}

// Categories that are considered "cuttable" (non-essential)
export const CUTTABLE_CATEGORIES = ['food_out', 'entertainment', 'shopping', 'travel']

// Categories that are essential
export const ESSENTIAL_CATEGORIES = ['food_home', 'transport', 'housing', 'health', 'education']

export const GOAL_COLORS = [
  '#FFFFFF', '#30D158', '#C7C7CC', '#8E8E93',
  '#FF9F0A', '#AEAEB2', '#636366', '#E5E5EA',
]

export const GOAL_EMOJIS = [
  '✈️', '🏠', '🚗', '💍', '📱', '🎓',
  '💰', '🏖️', '🎯', '🌟', '❤️', '🎁',
]
