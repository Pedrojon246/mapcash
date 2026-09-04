'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CurrencyInput } from '@/components/ui/currency-input'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, GOAL_COLORS, GOAL_EMOJIS, cn } from '@/lib/utils'
import type { Goal } from '@/lib/supabase/types'
import { Plus, CheckCircle2, Target, Pencil, PlusCircle, BookOpen, Loader2 } from 'lucide-react'
import { differenceInMonths, parseISO } from 'date-fns'
import { AutoTutorial } from '@/components/shared/auto-tutorial'
import { TutorialsModal } from '@/components/shared/tutorial-overlay'
import { useShowTutorial } from '@/lib/hooks/use-tutorial'

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showContrib, setShowContrib] = useState<Goal | null>(null)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [form, setForm] = useState({
    name: '', targetAmount: null as number | null,
    currentAmount: null as number | null, targetDate: '',
    color: GOAL_COLORS[0], emoji: GOAL_EMOJIS[0]
  })
  const [contrib, setContrib] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { t } = useI18n()
  const { visible: tutModalVisible, open: openTutModal, close: closeTutModal } = useShowTutorial('goals')

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at')
    setGoals(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  function openForm(g?: Goal) {
    setEditGoal(g || null)
    setForm({
      name: g?.name || '', targetAmount: g?.target_amount || null,
      currentAmount: g?.current_amount || null, targetDate: g?.target_date || '',
      color: g?.color || GOAL_COLORS[0], emoji: g?.emoji || GOAL_EMOJIS[0],
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.targetAmount || !form.name) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = {
      user_id: user.id, name: form.name, target_amount: form.targetAmount,
      current_amount: form.currentAmount || 0, target_date: form.targetDate || null,
      color: form.color, emoji: form.emoji,
    }
    const { error } = editGoal
      ? await supabase.from('goals').update(payload).eq('id', editGoal.id)
      : await supabase.from('goals').insert(payload)
    if (error) toast({ variant: 'destructive', title: t.error })
    else { toast({ variant: 'success', title: 'Meta salva!' }); setShowForm(false); load() }
    setSaving(false)
  }

  async function handleContrib(e: React.FormEvent) {
    e.preventDefault()
    if (!contrib || !showContrib) return
    setSaving(true)
    const newAmount = showContrib.current_amount + contrib
    const completed = newAmount >= showContrib.target_amount
    await supabase.from('goals').update({ current_amount: newAmount, completed }).eq('id', showContrib.id)
    toast({ variant: 'success', title: completed ? '🎉 Meta concluída!' : 'Valor adicionado!' })
    setShowContrib(null); setContrib(null); load(); setSaving(false)
  }

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={t.goalsTitle}
        large
        right={
          <div className="flex items-center gap-2">
            <button onClick={openTutModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable text-[12px] font-medium">
              <BookOpen className="w-3.5 h-3.5" /> Tutoriais
            </button>
            <Button size="icon" onClick={() => openForm()} className="w-9 h-9 rounded-full">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        }
      />

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-32 rounded-[20px] skeleton" />)}</div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-[17px]">{t.noGoals}</p>
            <p className="text-[14px] text-muted-foreground mt-1 max-w-[240px]">{t.noGoalsDesc}</p>
            <Button className="mt-5 h-11 px-6 rounded-full" onClick={() => openForm()}>
              <Plus className="w-4 h-4 mr-2" />{t.addGoal}
            </Button>
          </div>
        ) : goals.map(g => {
          const pct = Math.min((g.current_amount / g.target_amount) * 100, 100)
          const monthsLeft = g.target_date
            ? Math.max(differenceInMonths(parseISO(g.target_date), new Date()), 0)
            : null
          const suggested = monthsLeft && monthsLeft > 0
            ? (g.target_amount - g.current_amount) / monthsLeft
            : null

          return (
            <div key={g.id} className={cn(
              'p-5 bg-card rounded-[20px] border border-border/40',
              g.completed && 'opacity-70'
            )} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-2xl"
                    style={{ background: g.color + '18' }}>
                    {g.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-[16px]">{g.name}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {formatCurrency(g.current_amount)} / {formatCurrency(g.target_amount)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {!g.completed && (
                    <button onClick={() => setShowContrib(g)} className="p-2 rounded-full hover:bg-secondary pressable">
                      <PlusCircle className="w-4 h-4 text-primary" />
                    </button>
                  )}
                  <button onClick={() => openForm(g)} className="p-2 rounded-full hover:bg-secondary pressable">
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <Progress value={pct} color={g.completed ? '#34C759' : g.color} className="h-2" />
              <div className="flex justify-between mt-2.5">
                <span className="text-[12px] text-muted-foreground">{pct.toFixed(0)}%</span>
                {g.completed ? (
                  <span className="text-[12px] text-[#34C759] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t.completed}
                  </span>
                ) : suggested ? (
                  <span className="text-[12px] text-muted-foreground">
                    {t.suggestedMonthly}: {formatCurrency(suggested)}
                  </span>
                ) : monthsLeft !== null ? (
                  <span className="text-[12px] text-muted-foreground">{monthsLeft} {t.monthsLeft}</span>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Goal form */}
      <Dialog open={showForm} onOpenChange={open => !open && setShowForm(false)}>
        <DialogContent>
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-[18px] font-bold">{editGoal ? t.editGoal : t.addGoal}</h2>
            <div className="flex gap-2 flex-wrap">
              {GOAL_EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setForm(f => ({...f, emoji: e}))}
                  className={cn('text-2xl w-11 h-11 rounded-[12px] transition-all pressable',
                    form.emoji === e ? 'bg-primary/15 scale-110' : 'bg-secondary hover:bg-accent')}>
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {GOAL_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({...f, color: c}))}
                  className={cn('w-8 h-8 rounded-full transition-all pressable', form.color === c && 'ring-2 ring-offset-2 ring-foreground scale-110')}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="space-y-2">
              <Label>{t.goalName}</Label>
              <Input placeholder="Ex: Viagem, iPhone..." value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
            </div>
            <div className="space-y-2">
              <Label>{t.targetAmount}</Label>
              <CurrencyInput value={form.targetAmount} onChange={v => setForm(f => ({...f, targetAmount: v}))} size="large" />
            </div>
            {!editGoal && (
              <div className="space-y-2">
                <Label>{t.currentAmount} <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                <CurrencyInput value={form.currentAmount} onChange={v => setForm(f => ({...f, currentAmount: v}))} />
              </div>
            )}
            <div className="space-y-2">
              <Label>{t.targetDate} <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input type="date" value={form.targetDate} onChange={e => setForm(f => ({...f, targetDate: e.target.value}))} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="flex-1">{t.cancel}</Button>
              <Button type="submit" disabled={saving || !form.targetAmount || !form.name} className="flex-1">{t.save}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribution dialog */}
      <Dialog open={!!showContrib} onOpenChange={open => !open && setShowContrib(null)}>
        <DialogContent>
          <form onSubmit={handleContrib} className="space-y-4">
            <h2 className="text-[18px] font-bold">{t.addContribution}</h2>
            <p className="text-sm text-muted-foreground">Meta: <strong>{showContrib?.name}</strong></p>
            <CurrencyInput value={contrib} onChange={setContrib} size="large" autoFocus />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowContrib(null)} className="flex-1">{t.cancel}</Button>
              <Button type="submit" disabled={saving || !contrib} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AutoTutorial screen="goals" />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )
}
