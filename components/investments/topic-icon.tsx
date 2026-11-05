import { Landmark, BadgeCheck, Home, PiggyBank, Layers, Building2, LineChart, Percent, TrendingUp, ShieldCheck, Scale, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark, badge: BadgeCheck, home: Home, piggy: PiggyBank, layers: Layers,
  building: Building2, chart: LineChart, percent: Percent, trending: TrendingUp, shield: ShieldCheck, scale: Scale,
}

export function TopicIcon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] || Landmark
  return <I className={className || 'w-5 h-5'} strokeWidth={1.7} />
}
