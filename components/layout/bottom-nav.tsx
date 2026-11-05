'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, PieChart, Target, Users, BarChart2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none nav-bottom px-4">
      <div className="glass pointer-events-auto flex items-center gap-0.5 rounded-full border border-border dark:border-white/15 p-1.5 shadow-2xl shadow-black/40">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                'flex items-center justify-center gap-1.5 h-11 rounded-full pressable transition-all duration-200',
                active
                  ? 'bg-primary text-primary-foreground px-4'
                  : 'text-muted-foreground w-11 hover:text-foreground'
              )}
            >
              <Icon className="w-[20px] h-[20px]" strokeWidth={active ? 2 : 1.7} />
              {active && <span className="text-[13px] font-semibold tracking-tight">{label}</span>}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
