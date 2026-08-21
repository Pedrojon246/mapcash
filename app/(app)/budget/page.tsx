'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, CATEGORY_EMOJIS, CATEGORY_COLORS, currentMonth, cn } from '@/lib/utils'
import type { Budget, Transaction, Category } from '@/lib/supabase/types'
import { Plus, Pencil, AlertCircle } from 'lucide-react'

const CATEGORIES: Category[] = ['food','transport','housing','health','education','entertainment','shopping','travel','salary','freelance','investment','other']

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [spending, setSpending] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [category, setCategory] = useState<Category>('food')
  const [limit, setLimit] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { t } = useI18n()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const month = currentMonth()

    const [{ data: budgetsData }, { data: txData }] = await Promise.all([
      supabase.from('budgets').select('*').eq('user_id', user.id).eq('month', month),
      supabase.from('transactions').select('amount,category').eq('user_id', user.id)
        .eq('type', 'expense').gte('date', month + '-01').lte('date', month + '-31'),
    ])

    setBudgets(budgetsData || [])
    const sp: Record<string, number> = {}
    ;(txData || []).forEach((tx: any) => {
      sp[tx.category] = (sp[tx.category] || 0) + tx.amount
    })
    setSpending(sp)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function openForm(b?: Budget) {
    setEditBudget(b || null)
    setCategory(b?.category || 'food')
    setLimit(b?.monthly_limit || null)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!limit) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { user_id: user.id, category, monthly_limit: limit, month: currentMonth() }
    const { error } = editBudget
      ? await supabase.from('budgets').update({ monthly_limit: limit }).eq('id', editBudget.id)
      : await supabase.from('budgets').insert(payload)

    if (error) toast({ variant: 'destructive', title: t.error })
    else { toast({ variant: 'success', title: 'Orçamento salvo' }); setShowForm(false); load() }
    setSaving(false)
  }

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={t.budgetTitle}
        large
        right={
          <Button size="icon" onClick={() => openForm()}>
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}</div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-3xl">📊</div>
            <p className="font-semibold">{t.noBudgets}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">{t.noBudgetsDesc}</p>
            <Button className="mt-4" onClick={() => openForm()}><Plus className="w-4 h-4 mr-2" />{t.addBudget}</Button>
          </div>
        ) : budgets.map(b => {
          const spent = spending[b.category] || 0
          const pct = Math.min((spent / b.monthly_limit) * 100, 100)
          const over = spent > b.monthly_limit
          const near = !over && pct >= 80
          const color = over ? '#FF3B30' : near ? '#FF9500' : CATEGORY_COLORS[b.category]

          return (
            <div key={b.id} className="p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CATEGORY_EMOJIS[b.category]}</span>
                  <div>
                    <p className="font-semibold text-[15px]">
                      {t.categories[b.category as keyof typeof t.categories]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(spent)} / {formatCurrency(b.monthly_limit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {over && <AlertCircle className="w-4 h-4 text-[#FF3B30]" />}
                  <button onClick={() => openForm(b)} className="p-1.5 rounded-lg hover:bg-secondary pressable">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <Progress value={pct} color={color} />
              <div className="flex justify-between mt-2">
                <span className={cn('text-xs font-medium', over ? 'text-[#FF3B30]' : near ? 'text-[#FF9500]' : 'text-muted-foreground')}>
                  {over ? t.overBudget : near ? t.nearLimit : `${pct.toFixed(0)}%`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(Math.max(b.monthly_limit - spent, 0))} {t.remaining}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={showForm} onOpenChange={open => !open && setShowForm(false)}>
        <DialogContent>
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-[17px] font-semibold">{editBudget ? t.editBudget : t.addBudget}</h2>
            <div className="space-y-2">
              <Label>{t.category}</Label>
              <Select value={category} onValueChange={v => setCategory(v as Category)} disabled={!!editBudget}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_EMOJIS[c]} {t.categories[c as keyof typeof t.categories]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.monthlyLimit}</Label>
              <CurrencyInput value={limit} onChange={setLimit} size="large" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">{t.cancel}</Button>
              <Button type="submit" disabled={saving || !limit} className="flex-1">{t.save}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
