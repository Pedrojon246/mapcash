'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, CATEGORY_COLORS, CATEGORY_EMOJIS } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, Legend, PieChart, Pie, Cell,
} from 'recharts'
import type { Transaction } from '@/lib/supabase/types'
import { BarChart2, BookOpen, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight } from 'lucide-react'
import { AutoTutorial } from '@/components/shared/auto-tutorial'
import { TutorialsModal } from '@/components/shared/tutorial-overlay'
import { useShowTutorial } from '@/lib/hooks/use-tutorial'
import { format, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthSummary {
  month: string        // 'yyyy-MM'
  label: string        // 'Ago', 'Set'...
  income: number
  expenses: number
  savings: number
  savingsPct: number
  byCategory: Record<string, number>
}

function buildSummary(month: string, txs: Transaction[]): MonthSummary {
  const monthTxs = txs.filter(t => t.date.startsWith(month))
  const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const savings = income - expenses
  const savingsPct = income > 0 ? Math.round((Math.max(savings, 0) / income) * 100) : 0
  const byCategory: Record<string, number> = {}
  monthTxs.filter(t => t.type === 'expense').forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  })
  const label = format(parseISO(month + '-01'), 'MMM', { locale: ptBR })
  return { month, label: label.charAt(0).toUpperCase() + label.slice(1), income, expenses, savings, savingsPct, byCategory }
}

function Delta({ current, previous, format: fmt = 'currency' }: { current: number; previous: number; format?: 'currency' | 'pct' }) {
  if (previous === 0) return null
  const diff = current - previous
  const pct = Math.round((diff / Math.abs(previous)) * 100)
  if (Math.abs(pct) < 1) return <span className="text-[11px] text-muted-foreground flex items-center gap-0.5"><Minus className="w-3 h-3" /> igual</span>
  const positive = diff > 0
  const color = positive ? '#34C759' : '#FF3B30'
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span className="text-[11px] font-medium flex items-center gap-0.5" style={{ color }}>
      <Icon className="w-3 h-3" />
      {Math.abs(pct)}% vs mês ant.
    </span>
  )
}

export default function ReportsPage() {
  const [allTxs, setAllTxs] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [months, setMonths] = useState<MonthSummary[]>([])
  const supabase = createClient()
  const { t } = useI18n()
  const { visible: tutModalVisible, open: openTutModal, close: closeTutModal } = useShowTutorial('reports')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Fetch last 6 months of data
    const sixMonthsAgo = format(subMonths(new Date(), 5), 'yyyy-MM') + '-01'
    const { data } = await supabase
      .from('transactions').select('*').eq('user_id', user.id)
      .gte('date', sixMonthsAgo)
      .order('date', { ascending: true })
    const txs = data || []
    setAllTxs(txs)

    // Build summaries for last 6 months
    const summaries: MonthSummary[] = []
    for (let i = 5; i >= 0; i--) {
      const m = format(subMonths(new Date(), i), 'yyyy-MM')
      summaries.push(buildSummary(m, txs))
    }
    setMonths(summaries)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const currentSummary = months.find(m => m.month === selectedMonth)
  const selectedIdx = months.findIndex(m => m.month === selectedMonth)
  const prevSummary = selectedIdx > 0 ? months[selectedIdx - 1] : null

  const pieData = currentSummary
    ? Object.entries(currentSummary.byCategory)
        .map(([cat, value]) => ({ name: t.categories[cat as keyof typeof t.categories] || cat, cat, value }))
        .sort((a, b) => b.value - a.value)
    : []

  const trendData = months.filter(m => m.income > 0 || m.expenses > 0).map(m => ({
    name: m.label,
    Receita: m.income,
    Despesas: m.expenses,
    Guardado: Math.max(m.savings, 0),
  }))

  const hasData = allTxs.length > 0
  const currentHasData = (currentSummary?.income || 0) + (currentSummary?.expenses || 0) > 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-card border border-border rounded-[12px] p-3 shadow-lg text-[12px]">
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name}:</span>
            <span className="font-semibold">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) return (
    <div className="safe-top px-5 space-y-4 pt-4">
      <div className="h-8 w-32 rounded-xl skeleton" />
      <div className="h-12 rounded-[16px] skeleton" />
      <div className="h-48 rounded-[20px] skeleton" />
      <div className="h-48 rounded-[20px] skeleton" />
    </div>
  )

  return (
    <div className="animate-fade-in safe-top pb-8">
      <PageHeader
        title={t.reportsTitle}
        large
        right={
          <button onClick={openTutModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-[12px] font-medium pressable">
            <BookOpen className="w-3.5 h-3.5" /> Tutoriais
          </button>
        }
      />

      <div className="px-5 space-y-4">

        {/* Month selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectedIdx > 0 && setSelectedMonth(months[selectedIdx - 1].month)}
            disabled={selectedIdx <= 0}
            className="p-2 rounded-full bg-secondary pressable disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {months.map(m => {
                const active = m.month === selectedMonth
                const hasActivity = m.income > 0 || m.expenses > 0
                return (
                  <button
                    key={m.month}
                    onClick={() => setSelectedMonth(m.month)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all pressable ${
                      active
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {m.label}
                    {hasActivity && !active && (
                      <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => selectedIdx < months.length - 1 && setSelectedMonth(months[selectedIdx + 1].month)}
            disabled={selectedIdx >= months.length - 1}
            className="p-2 rounded-full bg-secondary pressable disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!currentHasData ? (
          <div className="flex flex-col items-center justify-center py-12 bg-card rounded-[20px] border border-border/40 text-center">
            <BarChart2 className="w-8 h-8 text-muted-foreground opacity-40 mb-3" />
            <p className="text-[15px] font-medium">Sem dados em {currentSummary?.label}</p>
            <p className="text-[13px] text-muted-foreground mt-1">Adicione lançamentos para ver o resumo.</p>
          </div>
        ) : (
          <>
            {/* Summary cards for selected month */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Receita', value: currentSummary?.income || 0, prev: prevSummary?.income, color: '#34C759' },
                { label: 'Despesas', value: currentSummary?.expenses || 0, prev: prevSummary?.expenses, color: '#FF3B30' },
                { label: 'Guardado', value: Math.max(currentSummary?.savings || 0, 0), prev: prevSummary ? Math.max(prevSummary.savings, 0) : undefined, color: '#007AFF', sub: `${currentSummary?.savingsPct || 0}%` },
              ].map(item => (
                <div key={item.label} className="p-3.5 bg-card rounded-[18px] border border-border/40"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                  <p className="text-[11px] text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-[14px] font-bold leading-tight" style={{ color: item.color }}>
                    {formatCurrency(item.value)}
                  </p>
                  {item.sub && <p className="text-[10px] text-muted-foreground">{item.sub} renda</p>}
                  {item.prev !== undefined && (
                    <div className="mt-1">
                      <Delta current={item.value} previous={item.prev} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 6-month trend — always visible if any data */}
        {hasData && trendData.length > 0 && (
          <div className="p-5 bg-card rounded-[20px] border border-border/40"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p className="font-semibold text-[15px] mb-1">Evolução dos últimos meses</p>
            <p className="text-[12px] text-muted-foreground mb-4">Receita, despesas e quanto guardou</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="Receita" stroke="#34C759" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Despesas" stroke="#FF3B30" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="Guardado" stroke="#007AFF" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Month bar comparison */}
        {hasData && trendData.length > 1 && (
          <div className="p-5 bg-card rounded-[20px] border border-border/40"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p className="font-semibold text-[15px] mb-4">Receita vs Despesas por mês</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={trendData} barGap={2} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Receita" fill="#34C759" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="Despesas" fill="#FF3B30" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown for selected month */}
        {currentHasData && pieData.length > 0 && (
          <div className="p-5 bg-card rounded-[20px] border border-border/40"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p className="font-semibold text-[15px] mb-4">
              Gastos por categoria — {currentSummary?.label}
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.cat] || '#8E8E93'} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.slice(0, 6).map((item, i) => {
                const prevCat = prevSummary?.byCategory[item.cat] || 0
                const diff = item.value - prevCat
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: CATEGORY_COLORS[item.cat] || '#8E8E93' }} />
                      <span className="text-[13px]">{CATEGORY_EMOJIS[item.cat]} {item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold">{formatCurrency(item.value)}</span>
                      {prevCat > 0 && (
                        <span className={`text-[10px] font-medium ${diff > 0 ? 'text-[#FF3B30]' : 'text-[#34C759]'}`}>
                          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!hasData && (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-[20px] border border-border/40 text-center">
            <BarChart2 className="w-8 h-8 text-muted-foreground opacity-40 mb-3" />
            <p className="text-[15px] font-medium">{t.noData}</p>
            <p className="text-[13px] text-muted-foreground mt-1">{t.noDataDesc}</p>
          </div>
        )}
      </div>

      <AutoTutorial screen="reports" />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )
}
