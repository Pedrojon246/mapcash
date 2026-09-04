'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, CATEGORY_COLORS, CATEGORY_EMOJIS, currentMonth } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { Transaction } from '@/lib/supabase/types'
import { BarChart2, BookOpen } from 'lucide-react'
import { AutoTutorial } from '@/components/shared/auto-tutorial'
import { TutorialsModal } from '@/components/shared/tutorial-overlay'
import { useShowTutorial } from '@/lib/hooks/use-tutorial'

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useI18n()
  const { visible: tutModalVisible, open: openTutModal, close: closeTutModal } = useShowTutorial('reports')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const month = currentMonth()
    const { data } = await supabase
      .from('transactions').select('*').eq('user_id', user.id)
      .gte('date', month + '-01').lte('date', month + '-31').order('date')
    setTransactions(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const expenses = transactions.filter(tx => tx.type === 'expense')
  const income = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
  const totalExpenses = expenses.reduce((s, tx) => s + tx.amount, 0)
  const savings = Math.max(income - totalExpenses, 0)
  const savingsPct = income > 0 ? Math.round((savings / income) * 100) : 0

  const byCategory = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(byCategory)
    .map(([cat, value]) => ({ name: t.categories[cat as keyof typeof t.categories] || cat, cat, value }))
    .sort((a, b) => b.value - a.value)

  const byDay = expenses.reduce((acc, tx) => {
    const day = tx.date.slice(8, 10)
    acc[day] = (acc[day] || 0) + tx.amount
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(byDay).map(([day, value]) => ({ day, value })).slice(-14)

  if (loading) return (
    <div className="safe-top px-5">
      <div className="h-8 w-32 rounded-xl skeleton mt-4 mb-6" />
      <div className="space-y-4">
        <div className="h-48 rounded-[20px] skeleton" />
        <div className="h-48 rounded-[20px] skeleton" />
      </div>
    </div>
  )

  if (transactions.length === 0) return (
    <div className="animate-fade-in safe-top">
      <PageHeader title={t.reportsTitle} large
        right={
          <button onClick={openTutModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-[12px] font-medium pressable">
            <BookOpen className="w-3.5 h-3.5" /> Tutoriais
          </button>
        }
      />
      <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <BarChart2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-semibold text-[17px]">{t.noData}</p>
        <p className="text-[14px] text-muted-foreground mt-1">{t.noDataDesc}</p>
      </div>
      <AutoTutorial screen="reports" />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )

  return (
    <div className="animate-fade-in safe-top pb-8">
      <PageHeader title={t.reportsTitle} large
        right={
          <button onClick={openTutModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-[12px] font-medium pressable">
            <BookOpen className="w-3.5 h-3.5" /> Tutoriais
          </button>
        }
      />

      <div className="px-5 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Receita', value: income, color: '#34C759' },
            { label: 'Despesas', value: totalExpenses, color: '#FF3B30' },
            { label: 'Guardado', value: savings, color: '#007AFF', sub: `${savingsPct}%` },
          ].map(item => (
            <div key={item.label} className="p-3.5 bg-card rounded-[18px] border border-border/40"
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
              <p className="text-[11px] text-muted-foreground mb-1">{item.label}</p>
              <p className="text-[15px] font-bold" style={{ color: item.color }}>
                {formatCurrency(item.value)}
              </p>
              {item.sub && <p className="text-[10px] text-muted-foreground">{item.sub} da renda</p>}
            </div>
          ))}
        </div>

        {/* Pie chart */}
        {pieData.length > 0 && (
          <div className="p-5 bg-card rounded-[20px] border border-border/40"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p className="font-semibold text-[15px] mb-4">{t.byCategory}</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.cat] || '#8E8E93'} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: CATEGORY_COLORS[item.cat] || '#8E8E93' }} />
                    <span className="text-[13px]">{CATEGORY_EMOJIS[item.cat]} {item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold">{formatCurrency(item.value)}</span>
                    <span className="text-[11px] text-muted-foreground w-8 text-right">
                      {((item.value / totalExpenses) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar chart */}
        {barData.length > 1 && (
          <div className="p-5 bg-card rounded-[20px] border border-border/40"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p className="font-semibold text-[15px] mb-4">Gastos por dia</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={barData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#1a1a2e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <AutoTutorial screen="reports" />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )
}
