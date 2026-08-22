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
import { LogOut, Moon, Sun, Globe, ChevronRight, User } from 'lucide-react'
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

      <div className="px-5 space-y-4">

        {/* Appearance */}
        <div className="bg-card rounded-2xl shadow-apple-sm border border-border/50 overflow-hidden">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">
            Aparência
          </p>

          <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/30">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
              <span className="text-[15px] font-medium">Tema escuro</span>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={v => setTheme(v ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* Language */}
        <div className="bg-card rounded-2xl shadow-apple-sm border border-border/50 overflow-hidden">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">
            Idioma
          </p>
          {([
            { code: 'pt', label: '🇧🇷 Português' },
            { code: 'en', label: '🇺🇸 English' },
          ] as { code: Locale; label: string }[]).map(lang => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className="w-full flex items-center justify-between px-4 py-3.5 border-t border-border/30 pressable hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-[15px] font-medium">{lang.label}</span>
              </div>
              {locale === lang.code && (
                <span className="text-primary text-sm font-semibold">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Account */}
        <div className="bg-card rounded-2xl shadow-apple-sm border border-border/50 overflow-hidden">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-4 pb-2">
            Conta
          </p>

          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 border-t border-border/30 pressable hover:bg-accent text-destructive"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="text-[15px] font-medium">Sair da conta</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Map Cash · versão 1.0
        </p>
      </div>

      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-[17px] font-semibold mb-1">Sair da conta?</h2>
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
