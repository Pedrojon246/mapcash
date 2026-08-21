'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, CATEGORY_COLORS, CATEGORY_EMOJIS, currentMonth } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { Transaction } from '@/lib/supabase/types'
import { BarChart2 } from 'lucide-react'

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { t } = useI18n()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const month = currentMonth()
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', month + '-01')
      .lte('date', month + '-31')
      .order('date')
    setTransactions(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  const expenses = transactions.filter(tx => tx.type === 'expense')
  const income = transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
  const totalExpenses = expenses.reduce((s, tx) => s + tx.amount, 0)

  // By category
  const byCategory = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount
    return acc
  }, {} as Record<string, number>)

  const pieData = Object.entries(byCategory)
    .map(([cat, value]) => ({ name: t.categories[cat as keyof typeof t.categories], cat, value }))
    .sort((a, b) => b.value - a.value)

  // Daily spending
  const byDay = expenses.reduce((acc, tx) => {
    const day = tx.date.slice(8, 10)
    acc[day] = (acc[day] || 0) + tx.amount
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(byDay)
    .map(([day, value]) => ({ day, value }))
    .slice(-14)

  if (loading) return (
    <div className="safe-top px-5">
      <div className="h-8 w-32 rounded-xl skeleton mt-4 mb-6" />
      <div className="space-y-4">
        <div className="h-48 rounded-2xl skeleton" />
        <div className="h-48 rounded-2xl skeleton" />
      </div>
    </div>
  )

  if (transactions.length === 0) return (
    <div className="animate-fade-in safe-top">
      <PageHeader title={t.reportsTitle} large />
      <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <BarChart2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-semibold">{t.noData}</p>
        <p className="text-sm text-muted-foreground mt-1">{t.noDataDesc}</p>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in safe-top pb-8">
      <PageHeader title={t.reportsTitle} large />
      <div className="px-5 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">{t.income}</p>
            <p className="text-xl font-bold text-[#34C759]">{formatCurrency(income)}</p>
          </div>
          <div className="p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">{t.expenses}</p>
            <p className="text-xl font-bold text-[#FF3B30]">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>

        {/* Pie chart */}
        {pieData.length > 0 && (
          <div className="p-5 bg-card rounded-2xl shadow-apple-sm border border-border/50">
            <p className="font-semibold mb-4">{t.byCategory}</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.cat]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{CATEGORY_EMOJIS[item.cat]}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {((item.value / totalExpenses) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar chart — daily */}
        {barData.length > 1 && (
          <div className="p-5 bg-card rounded-2xl shadow-apple-sm border border-border/50">
            <p className="font-semibold mb-4">Gastos por dia</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${v}`} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill="#007AFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
