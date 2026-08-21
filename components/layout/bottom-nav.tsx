'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, PieChart, Target, Users, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'

const navItems = [
  { href: '/wallet', icon: Wallet, key: 'wallet' },
  { href: '/budget', icon: PieChart, key: 'budget' },
  { href: '/goals', icon: Target, key: 'goals' },
  { href: '/groups', icon: Users, key: 'groups' },
  { href: '/reports', icon: BarChart2, key: 'reports' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 nav-bottom">
      <div className="flex items-center justify-around px-2 pt-2">
        {navItems.map(({ href, icon: Icon, key }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 pressable min-w-[56px]',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon
                className={cn('w-6 h-6 transition-all', active && 'scale-110')}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn('text-[10px] font-medium', active && 'font-semibold')}>
                {t[key as keyof typeof t] as string}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
