'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, PieChart, Target, Users, BarChart2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'

const navItems = [
  { href: '/wallet', icon: Wallet, label: 'Carteira' },
  { href: '/budget', icon: PieChart, label: 'Orçamento' },
  { href: '/goals', icon: Target, label: 'Metas' },
  { href: '/investments', icon: TrendingUp, label: 'Invest.' },
  { href: '/groups', icon: Users, label: 'Grupos' },
  { href: '/reports', icon: BarChart2, label: 'Mais' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-2xl mx-auto">
      {/* Glass background */}
      <div className="glass border-t border-border/40 nav-bottom">
        <div className="flex items-end justify-around px-1 pt-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-2 py-1 min-w-[48px] pressable"
              >
                <div className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200',
                  active ? 'scale-110' : ''
                )}>
                  <Icon
                    className={cn('transition-all duration-200', active ? 'w-6 h-6' : 'w-5 h-5')}
                    strokeWidth={active ? 2.2 : 1.6}
                    color={active ? '#007AFF' : undefined}
                    style={{ color: active ? '#007AFF' : 'var(--muted-foreground)' }}
                  />
                </div>
                <span className={cn(
                  'transition-all duration-200',
                  active
                    ? 'text-[10px] font-semibold'
                    : 'text-[10px] font-normal text-muted-foreground'
                )}
                style={{ color: active ? '#007AFF' : undefined }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
