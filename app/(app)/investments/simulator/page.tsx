'use client'
import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, cn } from '@/lib/utils'
import { DISCLAIMER } from '@/lib/investments/content'

interface Preset { label: string; rate: number }

function parseRate(v: string | undefined): number | null {
  if (!v) return null
  const n = parseFloat(v.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return isFinite(n) && n > 0 && n < 100 ? n : null
}

export default function SimulatorPage() {
  const [initial, setInitial] = useState<number | null>(1000)
  const [monthly, setMonthly] = useState<number | null>(300)
  const [rate, setRate] = useState('10')
  const [years, setYears] = useState(5)
  const [presets, setPresets] = useState<Preset[]>([])

  useEffect(() => {
    fetch('/api/market-data').then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.indicators) return
      const out: Preset[] = []
      const cdi = parseRate(d.indicators.find((i: any) => i.name === 'CDI')?.value)
      const selic = parseRate(d.indicators.find((i: any) => i.name === 'Selic')?.value)
      if (cdi) out.push({ label: `100% do CDI (${cdi.toString().replace('.', ',')}%)`, rate: cdi })
      if (selic) out.push({ label: `Selic (${selic.toString().replace('.', ',')}%)`, rate: selic })
      setPresets(out)
    }).catch(() => {})
  }, [])

  const r = Math.max(parseFloat(rate.replace(',', '.')) || 0, 0)
  const result = useMemo(() => {
    const monthlyRate = Math.pow(1 + r / 100, 1 / 12) - 1
    let balance = initial || 0
    let invested = initial || 0
    const points: { invested: number; total: number }[] = [{ invested, total: balance }]
    for (let m = 1; m <= years * 12; m++) {
      balance = balance * (1 + monthlyRate) + (monthly || 0)
      invested += monthly || 0
      if (m % 12 === 0) points.push({ invested, total: balance })
    }
    return { balance, invested, points }
  }, [initial, monthly, r, years])

  const W = 320, H = 130, max = Math.max(result.balance, 1)
  const x = (i: number) => (i / (result.points.length - 1 || 1)) * W
  const y = (v: number) => H - (v / max) * (H - 6) - 3
  const line = (key: 'invested' | 'total') => result.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(' ')

  return (
    <div className="animate-fade-in safe-top pb-8">
      <PageHeader title="Simulador" back />
      <div className="px-5 space-y-4">
        <div className="glass-card glass-hero rounded-[26px] p-5">
          <p className="section-label">Em {years} {years === 1 ? 'ano' : 'anos'} você teria</p>
          <p className="numeral mt-2 text-foreground">{formatCurrency(result.balance)}</p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="rounded-2xl bg-white/[0.05] bg-secondary/70 ring-1 ring-inset ring-white/10 p-3.5">
              <p className="text-[12px] text-muted-foreground">Você investiu</p>
              <p className="text-[16px] font-semibold tabular-nums mt-1">{formatCurrency(result.invested)}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.05] bg-secondary/70 ring-1 ring-inset ring-white/10 p-3.5">
              <p className="text-[12px] text-muted-foreground">Juros</p>
              <p className="text-[16px] font-semibold tabular-nums mt-1 text-income">{formatCurrency(result.balance - result.invested)}</p>
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-5" role="img" aria-label="Evolução do saldo ao longo dos anos">
            <path d={`${line('total')} L${W},${H} L0,${H} Z`} fill="hsl(var(--income))" opacity="0.12" />
            <path d={line('total')} fill="none" stroke="hsl(var(--income))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={line('invested')} fill="none" stroke="hsl(var(--foreground))" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.7" />
          </svg>
          <div className="flex gap-4 text-[11px] text-muted-foreground mt-2">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-income inline-block" /> Com juros</span>
            <span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-foreground inline-block" /> Só o que você aportou</span>
          </div>
        </div>

        <div className="glass-card rounded-[22px] p-5 space-y-4">
          <div className="space-y-2">
            <Label>Valor inicial</Label>
            <CurrencyInput value={initial} onChange={setInitial} />
          </div>
          <div className="space-y-2">
            <Label>Aporte por mês</Label>
            <CurrencyInput value={monthly} onChange={setMonthly} />
          </div>
          <div className="space-y-2">
            <Label>Rendimento ao ano (%)</Label>
            <Input inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)} />
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {presets.map(p => (
                  <button key={p.label} type="button" onClick={() => setRate(String(p.rate).replace('.', ','))}
                    className={cn('px-3 h-8 rounded-full text-[12px] font-medium pressable bg-secondary text-muted-foreground')}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Prazo</Label>
              <span className="text-[14px] font-semibold tabular-nums">{years} {years === 1 ? 'ano' : 'anos'}</span>
            </div>
            <input type="range" min={1} max={40} step={1} value={years} onChange={e => setYears(parseInt(e.target.value, 10))}
              className="w-full accent-foreground" aria-label="Prazo em anos" />
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center px-4 leading-relaxed">
          Valores brutos, antes de imposto de renda e taxas. O rendimento real varia. {DISCLAIMER}
        </p>
      </div>
    </div>
  )
}
