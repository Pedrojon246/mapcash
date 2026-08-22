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
import type { Budget, Category } from '@/lib/supabase/types'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'

const EXPENSE_CATEGORIES: Category[] = [
  'food_home', 'food_out', 'transport', 'housing',
  'health', 'education', 'entertainment', 'shopping', 'travel', 'other'
]

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [spending, setSpending] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [category, setCategory] = useState<Category>('food_home')
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
      supabase.from('transactions').select('amount,category')
        .eq('user_id', user.id).eq('type', 'expense')
        .gte('date', month + '-01').lte('date', month + '-31'),
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

  function openAdd() {
    setEditBudget(null)
    setCategory('food_home')
    setLimit(null)
    setShowForm(true)
  }

  function openEdit(b: Budget) {
    setEditBudget(b)
    setCategory(b.category as Category)
    setLimit(b.monthly_limit)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!limit) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = editBudget
      ? await supabase.from('budgets').update({ monthly_limit: limit, category }).eq('id', editBudget.id)
      : await supabase.from('budgets').insert({
          user_id: user.id, category,
          monthly_limit: limit, month: currentMonth()
        })

    if (error) toast({ variant: 'destructive', title: t.error, description: error.message })
    else { toast({ variant: 'success', title: 'Orçamento salvo' }); setShowForm(false); load() }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    const { error } = await supabase.from('budgets').delete().eq('id', deleteId)
    if (error) toast({ variant: 'destructive', title: t.error })
    else { toast({ variant: 'success', title: 'Orçamento removido' }); load() }
    setDeleteId(null)
  }

  const getCatLabel = (cat: string) => {
    const key = cat as keyof typeof t.categories
    return t.categories[key] || cat
  }

  const getCatEmoji = (cat: string) => CATEGORY_EMOJIS[cat] || '📦'
  const getCatColor = (cat: string) => CATEGORY_COLORS[cat] || '#8E8E93'

  // Categories already budgeted this month
  const budgetedCats = new Set(budgets.map(b => b.category))
  const availableCats = EXPENSE_CATEGORIES.filter(c => !budgetedCats.has(c) || c === editBudget?.category)

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={t.budgetTitle}
        large
        right={
          <Button size="icon" onClick={openAdd}>
            <Plus className="w-5 h-5" />
          </Button>
        }
      />

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl skeleton" />)}
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-3xl">📊</div>
            <p className="font-semibold">{t.noBudgets}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">{t.noBudgetsDesc}</p>
            <Button className="mt-4" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />{t.addBudget}
            </Button>
          </div>
        ) : budgets.map(b => {
          const spent = spending[b.category] || 0
          const pct = Math.min((spent / b.monthly_limit) * 100, 100)
          const over = spent > b.monthly_limit
          const near = !over && pct >= 80
          const color = over ? '#FF3B30' : near ? '#FF9500' : getCatColor(b.category)

          return (
            <div key={b.id} className="p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: getCatColor(b.category) + '20' }}
                  >
                    {getCatEmoji(b.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-[15px]">{getCatLabel(b.category)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(spent)} / {formatCurrency(b.monthly_limit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {over && <AlertCircle className="w-4 h-4 text-[#FF3B30]" />}
                  <button
                    onClick={() => openEdit(b)}
                    className="p-2 rounded-xl hover:bg-secondary pressable"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="p-2 rounded-xl hover:bg-destructive/10 pressable"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>

              <Progress value={pct} color={color} />

              <div className="flex justify-between mt-2">
                <span className={cn(
                  'text-xs font-medium',
                  over ? 'text-[#FF3B30]' : near ? 'text-[#FF9500]' : 'text-muted-foreground'
                )}>
                  {over ? `⚠️ ${t.overBudget}` : near ? `⚡ ${t.nearLimit}` : `${pct.toFixed(0)}%`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(Math.max(b.monthly_limit - spent, 0))} {t.remaining}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Form dialog */}
      <Dialog open={showForm} onOpenChange={open => !open && setShowForm(false)}>
        <DialogContent>
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-[17px] font-semibold">
              {editBudget ? t.editBudget : t.addBudget}
            </h2>

            <div className="space-y-2">
              <Label>{t.category}</Label>
              <Select
                value={category}
                onValueChange={v => setCategory(v as Category)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCats.map(c => (
                    <SelectItem key={c} value={c}>
                      {getCatEmoji(c)} {getCatLabel(c)}
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
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                {t.cancel}
              </Button>
              <Button type="submit" disabled={saving || !limit} className="flex-1">
                {t.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-[17px] font-semibold mb-1">{t.confirmDelete}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t.confirmDeleteDesc}</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">
                {t.cancel}
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                {t.delete}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
