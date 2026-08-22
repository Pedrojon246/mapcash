'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Wallet, PieChart, Target, Users, BarChart2, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/wallet', icon: Wallet, key: 'wallet' },
  { href: '/budget', icon: PieChart, key: 'budget' },
  { href: '/goals', icon: Target, key: 'goals' },
  { href: '/groups', icon: Users, key: 'groups' },
  { href: '/reports', icon: BarChart2, key: 'reports' },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const supabase = createClient()
  const [showLogout, setShowLogout] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50 nav-bottom max-w-2xl mx-auto">
        <div className="flex items-center justify-around px-1 pt-2">
          {navItems.map(({ href, icon: Icon, key }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 pressable min-w-[48px]',
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

          {/* Logout button */}
          <button
            onClick={() => setShowLogout(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-muted-foreground pressable min-w-[48px]"
          >
            <LogOut className="w-6 h-6" strokeWidth={1.8} />
            <span className="text-[10px] font-medium">Sair</span>
          </button>
        </div>
      </nav>

      {/* Logout confirm dialog */}
      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-[17px] font-semibold mb-1">Sair da conta?</h2>
            <p className="text-sm text-muted-foreground mb-6">Você precisará entrar novamente para acessar o app.</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowLogout(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleLogout} className="flex-1">
                Sair
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
