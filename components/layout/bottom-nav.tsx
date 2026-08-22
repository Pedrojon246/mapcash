'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, PieChart, Target, Users, BarChart2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'

const navItems = [
  { href: '/wallet', icon: Wallet, labelKey: 'wallet' },
  { href: '/budget', icon: PieChart, labelKey: 'budget' },
  { href: '/goals', icon: Target, labelKey: 'goals' },
  { href: '/investments', icon: TrendingUp, label: 'Invest.' },
  { href: '/groups', icon: Users, labelKey: 'groups' },
  { href: '/reports', icon: BarChart2, labelKey: 'reports' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 nav-bottom max-w-2xl mx-auto">
      <div className="flex items-center justify-around px-1 pt-1.5">
        {navItems.map(({ href, icon: Icon, labelKey, label }) => {
          const active = pathname.startsWith(href)
          const displayLabel = label || (labelKey ? (t[labelKey as keyof typeof t] as string) : '')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 pressable min-w-[44px]',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon
                className={cn('w-[22px] h-[22px] transition-all', active && 'scale-110')}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn('text-[9px] font-medium', active && 'font-semibold')}>
                {displayLabel}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
