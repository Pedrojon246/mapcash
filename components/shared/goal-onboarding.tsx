'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, HandCoins, PiggyBank, TrendingUp, Loader2, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/logo'

export const GOAL_OPTIONS: { id: string; title: string; desc: string; icon: LucideIcon }[] = [
  { id: 'organizar', title: 'Organizar meus gastos', desc: 'Saber para onde o dinheiro vai', icon: ClipboardList },
  { id: 'dividas', title: 'Sair das dívidas', desc: 'Parar de pagar juros', icon: HandCoins },
  { id: 'meta', title: 'Juntar dinheiro pra uma meta', desc: 'Viagem, reserva, um sonho', icon: PiggyBank },
  { id: 'investir', title: 'Começar a investir', desc: 'Entender como e onde', icon: TrendingUp },
]

export function GoalOnboarding({ show }: { show: boolean }) {
  const [open, setOpen] = useState(show)
  const [saving, setSaving] = useState<string | null>(null)
  const router = useRouter()

  if (!open) return null

  async function choose(id: string) {
    setSaving(id)
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({ data: { goal: id } })
    } catch {}
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="dark ambient fixed inset-0 z-[100] bg-background text-foreground overflow-y-auto animate-fade-in safe-top">
      <div className="min-h-full max-w-md mx-auto px-6 py-10 flex flex-col justify-center">
        <Logo size={56} className="mb-6" />
        <h1 className="text-[30px] font-bold tracking-[-0.8px] leading-tight">Qual é a sua prioridade agora?</h1>
        <p className="text-[15px] text-muted-foreground mt-2 mb-7">Escolha uma. Vamos montar o seu caminho a partir dela.</p>

        <div className="space-y-3">
          {GOAL_OPTIONS.map(({ id, title, desc, icon: Icon }) => (
            <button key={id} type="button" disabled={!!saving} onClick={() => choose(id)}
              className="glass-card rounded-[22px] w-full flex items-center gap-4 p-4 text-left pressable disabled:opacity-60">
              <div className="icon-tile">
                {saving === id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" strokeWidth={1.7} />}
              </div>
              <div>
                <p className="font-semibold text-[16px] tracking-tight">{title}</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button type="button" disabled={!!saving} onClick={() => choose('skip')}
          className="mt-6 text-[13px] text-muted-foreground underline underline-offset-4 self-center pressable">
          Pular por enquanto
        </button>
      </div>
    </div>
  )
}
