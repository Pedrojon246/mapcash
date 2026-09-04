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
import { Plus, Pencil, Trash2, AlertCircle, BookOpen } from 'lucide-react'
import { AutoTutorial } from '@/components/shared/auto-tutorial'
import { TutorialsModal } from '@/components/shared/tutorial-overlay'
import { useShowTutorial } from '@/lib/hooks/use-tutorial'

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
  const { visible: tutModalVisible, open: openTutModal, close: closeTutModal } = useShowTutorial('budget')

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
    ;(txData || []).forEach((tx: any) => { sp[tx.category] = (sp[tx.category] || 0) + tx.amount })
    setSpending(sp)
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function openAdd() { setEditBudget(null); setCategory('food_home'); setLimit(null); setShowForm(true) }
  function openEdit(b: Budget) { setEditBudget(b); setCategory(b.category as Category); setLimit(b.monthly_limit); setShowForm(true) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!limit) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = editBudget
      ? await supabase.from('budgets').update({ monthly_limit: limit, category }).eq('id', editBudget.id)
      : await supabase.from('budgets').insert({ user_id: user.id, category, monthly_limit: limit, month: currentMonth() })
    if (error) toast({ variant: 'destructive', title: t.error })
    else { toast({ variant: 'success', title: 'Orçamento salvo' }); setShowForm(false); load() }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    await supabase.from('budgets').delete().eq('id', deleteId)
    toast({ variant: 'success', title: 'Removido' })
    setDeleteId(null); load()
  }

  const getCatLabel = (cat: string) => t.categories[cat as keyof typeof t.categories] || cat
  const getCatEmoji = (cat: string) => CATEGORY_EMOJIS[cat] || '📦'
  const getCatColor = (cat: string) => CATEGORY_COLORS[cat] || '#8E8E93'
  const budgetedCats = new Set(budgets.map(b => b.category))
  const availableCats = EXPENSE_CATEGORIES.filter(c => !budgetedCats.has(c) || c === editBudget?.category)

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={t.budgetTitle}
        large
        right={
          <div className="flex items-center gap-2">
            <button onClick={openTutModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable text-[12px] font-medium">
              <BookOpen className="w-3.5 h-3.5" /> Tutoriais
            </button>
            <Button size="icon" onClick={openAdd} className="w-9 h-9 rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-[20px] skeleton" />)}</div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 text-3xl">📊</div>
            <p className="font-semibold text-[17px]">{t.noBudgets}</p>
            <p className="text-[14px] text-muted-foreground mt-1 max-w-[240px]">{t.noBudgetsDesc}</p>
            <Button className="mt-5 h-11 px-6 rounded-full" onClick={openAdd}>
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
            <div key={b.id} className="p-5 bg-card rounded-[20px] border border-border/40"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[14px] flex items-center justify-center text-xl"
                    style={{ background: getCatColor(b.category) + '18' }}>
                    {getCatEmoji(b.category)}
                  </div>
                  <div>
                    <p className="font-semibold text-[16px]">{getCatLabel(b.category)}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {formatCurrency(spent)} de {formatCurrency(b.monthly_limit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {over && <AlertCircle className="w-4 h-4 text-[#FF3B30] mr-1" />}
                  <button onClick={() => openEdit(b)} className="p-2 rounded-full hover:bg-secondary pressable">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteId(b.id)} className="p-2 rounded-full hover:bg-destructive/10 pressable">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
              <Progress value={pct} color={color} className="h-2.5" />
              <div className="flex justify-between mt-2.5">
                <span className={cn('text-[12px] font-medium',
                  over ? 'text-[#FF3B30]' : near ? 'text-[#FF9500]' : 'text-muted-foreground')}>
                  {over ? '⚠️ Limite ultrapassado' : near ? '⚡ Próximo do limite' : `${pct.toFixed(0)}%`}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {formatCurrency(Math.max(b.monthly_limit - spent, 0))} restante
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={showForm} onOpenChange={open => !open && setShowForm(false)}>
        <DialogContent>
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-[18px] font-bold">{editBudget ? t.editBudget : t.addBudget}</h2>
            <div className="space-y-2">
              <Label>{t.category}</Label>
              <Select value={category} onValueChange={v => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableCats.map(c => (
                    <SelectItem key={c} value={c}>{getCatEmoji(c)} {getCatLabel(c)}</SelectItem>
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

      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent>
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <h2 className="text-[17px] font-semibold mb-1">{t.confirmDelete}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t.confirmDeleteDesc}</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">{t.cancel}</Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1">{t.delete}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AutoTutorial screen="budget" />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )
}
