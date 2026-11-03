import {
  ShoppingCart, UtensilsCrossed, Car, Home, HeartPulse, GraduationCap, Gamepad2,
  ShoppingBag, Plane, Briefcase, Laptop, TrendingUp, Package, Target, Gem, Smartphone,
  Wallet, Palmtree, Star, Heart, Gift, Users, PartyPopper, Pizza, Music, Globe, Tent,
  Landmark, BarChart3, Newspaper, Bell, Pencil, Plus, FolderOpen, CalendarDays, Link2,
  Scale, CreditCard, Sparkles, type LucideIcon,
} from 'lucide-react'

/** Category key → line icon (replaces emoji everywhere in the UI) */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  food_home: ShoppingCart,
  food_out: UtensilsCrossed,
  transport: Car,
  housing: Home,
  health: HeartPulse,
  education: GraduationCap,
  entertainment: Gamepad2,
  shopping: ShoppingBag,
  travel: Plane,
  salary: Briefcase,
  freelance: Laptop,
  investment: TrendingUp,
  other: Package,
}

/**
 * Goals/groups/tutorials store an emoji string. We keep the stored value
 * (no DB change) and render it as a line icon.
 */
const GLYPH_ICONS: Record<string, LucideIcon> = {
  '✈️': Plane, '🏠': Home, '🚗': Car, '💍': Gem, '📱': Smartphone, '🎓': GraduationCap,
  '💰': Wallet, '🏖️': Palmtree, '🎯': Target, '🌟': Star, '❤️': Heart, '🎁': Gift,
  '👥': Users, '🎉': PartyPopper, '🍕': Pizza, '🎮': Gamepad2, '🎵': Music, '🌍': Globe,
  '💼': Briefcase, '🏕️': Tent, '🏦': Landmark, '📊': BarChart3, '🛒': ShoppingCart,
  '📈': TrendingUp, '📰': Newspaper, '🔔': Bell, '✏️': Pencil, '➕': Plus, '📂': FolderOpen,
  '📅': CalendarDays, '🔗': Link2, '⚖️': Scale, '💳': CreditCard,
}

export function CategoryIcon({ category, className = 'w-[18px] h-[18px]', strokeWidth = 1.8 }:
  { category: string; className?: string; strokeWidth?: number }) {
  const Icon = CATEGORY_ICONS[category] || Package
  return <Icon className={className} strokeWidth={strokeWidth} />
}

export function GlyphIcon({ glyph, className = 'w-5 h-5', strokeWidth = 1.8 }:
  { glyph?: string | null; className?: string; strokeWidth?: number }) {
  const Icon = (glyph && GLYPH_ICONS[glyph]) || Sparkles
  return <Icon className={className} strokeWidth={strokeWidth} />
}

/** Icon choices offered when creating goals/groups (stored as their emoji key) */
export const GOAL_GLYPHS = ['✈️', '🏠', '🚗', '💍', '📱', '🎓', '💰', '🏖️', '🎯', '🌟', '❤️', '🎁']
export const GROUP_GLYPHS = ['✈️', '🏖️', '🏕️', '🎉', '🍕', '🎮', '🏠', '🎵', '🌍', '💼', '🎓', '❤️']
