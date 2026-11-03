'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { useI18n } from '@/lib/i18n/context'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { LogOut, Moon, Sun, Globe, ChevronRight, Check } from 'lucide-react'
import { InstallCard } from '@/components/shared/pwa'
import type { Locale } from '@/lib/i18n/translations'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { t, locale, setLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const [showLogout, setShowLogout] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isDark = theme === 'dark'

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader title="Ajustes" large />

      <div className="px-5 space-y-5">

        <InstallCard />

        {/* Appearance */}
        <div>
          <p className="section-label px-1 mb-2">Aparência</p>
          <div className="list-group">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3.5">
                <div className="icon-tile">{isDark ? <Moon className="w-5 h-5" strokeWidth={1.8} /> : <Sun className="w-5 h-5" strokeWidth={1.8} />}</div>
                <span className="text-[16px] font-medium tracking-tight">Tema escuro</span>
              </div>
              <Switch checked={isDark} onCheckedChange={v => setTheme(v ? 'dark' : 'light')} />
            </div>
          </div>
        </div>

        {/* Language */}
        <div>
          <p className="section-label px-1 mb-2">Idioma</p>
          <div className="list-group">
            {([
              { code: 'pt', label: 'Português' },
              { code: 'en', label: 'English' },
            ] as { code: Locale; label: string }[]).map(lang => (
              <button
                key={lang.code}
                onClick={() => setLocale(lang.code)}
                className="w-full flex items-center justify-between px-4 py-3.5 pressable"
              >
                <div className="flex items-center gap-3.5">
                  <div className="icon-tile"><Globe className="w-5 h-5" strokeWidth={1.8} /></div>
                  <span className="text-[16px] font-medium tracking-tight">{lang.label}</span>
                </div>
                {locale === lang.code && <Check className="w-5 h-5 text-foreground" strokeWidth={2.2} />}
              </button>
            ))}
          </div>
        </div>

        {/* Account */}
        <div>
          <p className="section-label px-1 mb-2">Conta</p>
          <div className="list-group">
            <button onClick={() => setShowLogout(true)} className="w-full flex items-center justify-between px-4 py-3.5 pressable">
              <div className="flex items-center gap-3.5">
                <div className="icon-tile"><LogOut className="w-5 h-5" strokeWidth={1.8} /></div>
                <span className="text-[16px] font-medium tracking-tight">Sair da conta</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">Map Cash · versão 1.1</p>
      </div>

      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 text-foreground" strokeWidth={1.7} />
            </div>
            <h2 className="text-[20px] font-bold tracking-tight mb-1">Sair da conta?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Você precisará entrar novamente para acessar o app.
            </p>
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
    </div>
  )
}
