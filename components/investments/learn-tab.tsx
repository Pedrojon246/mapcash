'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calculator, Check, ChevronRight, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, cn } from '@/lib/utils'
import { PRODUCTS, LESSONS, TRAIL, RISK_LABEL, DISCLAIMER } from '@/lib/investments/content'
import { GOAL_OPTIONS } from '@/components/shared/goal-onboarding'
import { TopicIcon } from '@/components/investments/topic-icon'
import type { Goal } from '@/lib/supabase/types'

const STORAGE_KEY = 'mc_trail_done'
const MANUAL = ['dividas', 'renda-fixa', 'diversificar']

interface TrailData {
  txLast30: number
  avgExpense: number
  reserve: Goal | null
  goal: string | null
}

export function LearnTab() {
  const [data, setData] = useState<TrailData | null>(null)
  const [manual, setManual] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    try { setManual(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')) } catch {}
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const since90 = new Date(); since90.setDate(since90.getDate() - 90)
      const since30 = new Date(); since30.setDate(since30.getDate() - 30)
      const iso = (d: Date) => d.toISOString().slice(0, 10)
      const [{ data: tx }, { data: goals }] = await Promise.all([
        supabase.from('transactions').select('type, amount, date').eq('user_id', user.id).gte('date', iso(since90)),
        supabase.from('goals').select('*').eq('user_id', user.id),
      ])
      const rows = tx || []
      const expenses = rows.filter(r => r.type === 'expense').reduce((s, r) => s + Number(r.amount), 0)
      setData({
        txLast30: rows.filter(r => r.date >= iso(since30)).length,
        avgExpense: expenses / 3,
        reserve: ((goals || []) as Goal[]).find(g => /reserva|emerg/i.test(g.name)) || null,
        goal: (user.user_metadata?.goal as string) || null,
      })
    })()
  }, [supabase])

  function toggleManual(id: string) {
    const next = manual.includes(id) ? manual.filter(x => x !== id) : [...manual, id]
    setManual(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  const target = (data?.avgExpense || 0) * 6
  const saved = data?.reserve?.current_amount || 0
  const done: Record<string, boolean> = {
    organizar: (data?.txLast30 || 0) >= 5,
    reserva: target > 0 && saved >= target,
    dividas: manual.includes('dividas'),
    'renda-fixa': manual.includes('renda-fixa'),
    diversificar: manual.includes('diversificar'),
  }
  // The priority picked at onboarding decides where the trail starts
  const START_STEP: Record<string, string> = { organizar: 'organizar', dividas: 'dividas', meta: 'reserva', investir: 'renda-fixa' }
  const startIdx = Math.max(TRAIL.findIndex(s => s.id === START_STEP[data?.goal || '']), 0)
  const firstUndone = TRAIL.findIndex((s, i) => i >= startIdx && !done[s.id])
  const allDone = TRAIL.slice(startIdx).every(s => done[s.id])
  const currentIdx = firstUndone === -1 ? startIdx : firstUndone
  const focus = GOAL_OPTIONS.find(o => o.id === data?.goal)
  const current = TRAIL[currentIdx]

  let detail = current.description
  let action = current.href ? { href: current.href, label: current.hrefLabel || 'Continuar' } : null
  if (data && current.id === 'reserva') {
    if (target === 0) detail = 'Registre alguns gastos na Carteira para calcular quanto você precisa guardar.'
    else if (!data.reserve) {
      detail = `Seis meses dos seus gastos dão cerca de ${formatCurrency(target)}. Crie uma meta chamada Reserva de emergência para acompanhar.`
      action = { href: '/goals', label: 'Criar meta' }
    } else detail = `Faltam ${formatCurrency(Math.max(target - saved, 0))} para chegar em seis meses de gastos (${formatCurrency(target)}).`
    if (data.reserve) action = { href: '/goals', label: 'Ver minhas metas' }
  }

  return (
    <div className="space-y-6">
      {/* Trail */}
      {!data ? (
        <div className="h-48 rounded-[26px] skeleton" />
      ) : (
        <div>
          <div className="glass-card glass-hero rounded-[26px] p-5">
            <p className="section-label">Sua trilha{focus ? ` · ${focus.title}` : ''}</p>
            <p className="text-[22px] font-semibold tracking-tight mt-1.5 leading-tight">
              {allDone ? 'Trilha concluída' : current.title}
            </p>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              {allDone ? 'Você passou por todos os passos. Continue aprendendo e revisando.' : `Passo ${currentIdx + 1} de ${TRAIL.length} · ${detail}`}
            </p>
            <div className="flex gap-1.5 mt-4">
              {TRAIL.map((s, i) => (
                <div key={s.id} className={cn('flex-1 h-[5px] rounded-full',
                  done[s.id] ? 'bg-income' : i === currentIdx && !allDone ? 'bg-foreground' : 'bg-foreground/15')} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {action && !allDone && (
                <Link href={action.href} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[13px] font-semibold px-4 py-2.5 rounded-full pressable">
                  {action.label} <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {MANUAL.includes(current.id) && !allDone && (
                <button onClick={() => toggleManual(current.id)}
                  className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-[13px] font-semibold px-4 py-2.5 rounded-full pressable">
                  <Check className="w-4 h-4" /> Já fiz
                </button>
              )}
              <button onClick={() => setShowAll(v => !v)} className="text-[12px] text-muted-foreground underline underline-offset-4 pressable ml-auto">
                {showAll ? 'Esconder passos' : 'Ver todos os passos'}
              </button>
            </div>
            {showAll && (
              <div className="mt-4 space-y-3 animate-slide-down">
                {TRAIL.map((s, i) => {
                  const manualStep = MANUAL.includes(s.id)
                  const Row = (
                    <div className="flex items-start gap-3 text-left">
                      {done[s.id]
                        ? <Check className="w-[18px] h-[18px] text-income mt-0.5 flex-shrink-0" strokeWidth={2.4} />
                        : <Circle className="w-[18px] h-[18px] text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.6} />}
                      <div>
                        <p className="text-[14px] font-medium">{i + 1}. {s.title}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{s.description}</p>
                      </div>
                    </div>
                  )
                  return manualStep
                    ? <button key={s.id} type="button" onClick={() => toggleManual(s.id)} className="block w-full pressable">{Row}</button>
                    : <div key={s.id}>{Row}</div>
                })}
                <p className="text-[11px] text-muted-foreground">Toque nos passos 3 a 5 para marcar como feito.</p>
              </div>
            )}
          </div>
          <div className="glass-reflection" aria-hidden />
        </div>
      )}

      {/* Where to invest */}
      <div>
        <p className="text-[17px] font-semibold tracking-tight mb-3 px-1">Onde investir</p>
        <div className="space-y-2">
          {PRODUCTS.map(p => (
            <Link key={p.slug} href={`/investments/learn/${p.slug}`}
              className="flex items-center gap-3.5 p-3.5 glass-card rounded-[20px] pressable">
              <div className="icon-tile"><TopicIcon name={p.icon} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[15px] tracking-tight">{p.title}</p>
                <p className="text-[12px] text-muted-foreground truncate">Risco {RISK_LABEL[p.risk!].toLowerCase()} · {p.summary}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={1.8} />
            </Link>
          ))}
        </div>
      </div>

      {/* Simulator */}
      <Link href="/investments/simulator" className="flex items-center gap-3.5 p-4 glass-card rounded-[22px] pressable">
        <div className="icon-tile"><Calculator className="w-5 h-5" strokeWidth={1.7} /></div>
        <div className="flex-1">
          <p className="font-semibold text-[16px] tracking-tight">Simulador</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">Quanto o seu dinheiro vira com o tempo?</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" strokeWidth={1.8} />
      </Link>

      {/* Lessons */}
      <div>
        <p className="text-[17px] font-semibold tracking-tight mb-3 px-1">Aprenda em 2 minutos</p>
        <div className="grid grid-cols-2 gap-2.5">
          {LESSONS.map((l, i) => (
            <Link key={l.slug} href={`/investments/learn/${l.slug}`} className="p-4 glass-card rounded-[20px] pressable">
              <p className="text-[11px] text-muted-foreground mb-2">Lição {i + 1}</p>
              <p className="font-semibold text-[14px] leading-snug tracking-tight">{l.title}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground text-center px-4 leading-relaxed">{DISCLAIMER}</p>
    </div>
  )
}
