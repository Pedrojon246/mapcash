'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CurrencyInput } from '@/components/ui/currency-input'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { Group, GroupMember, GroupExpense } from '@/lib/supabase/types'
import { Plus, Copy, Check, Users, Receipt, Scale, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Balance {
  name: string
  userId: string | null
  net: number
}

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<(GroupMember & { profile?: { name: string } })[]>([])
  const [expenses, setExpenses] = useState<(GroupExpense & { splits?: any[] })[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExpense, setShowExpense] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  const [expForm, setExpForm] = useState({
    description: '', amount: null as number | null,
    paidBy: '', date: format(new Date(), 'yyyy-MM-dd'),
  })

  const supabase = createClient()
  const { t } = useI18n()
  const { groupId } = params

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const [{ data: grp }, { data: mems }, { data: exps }] = await Promise.all([
      supabase.from('groups').select('*').eq('id', groupId).single(),
      supabase.from('group_members').select('*, profile:profiles(name)').eq('group_id', groupId),
      supabase.from('group_expenses').select('*, splits:group_expense_splits(*)').eq('group_id', groupId).order('date', { ascending: false }),
    ])

    setGroup(grp)
    setMembers(mems || [])
    setExpenses(exps || [])
    if (mems?.length) setExpForm(f => ({ ...f, paidBy: user.id }))

    // Calculate balances
    const bal: Record<string, { name: string; userId: string | null; net: number }> = {}
    ;(mems || []).forEach((m: any) => {
      const key = m.user_id || m.guest_name || ''
      const name = m.profile?.name || m.guest_name || 'Convidado'
      bal[key] = { name, userId: m.user_id, net: 0 }
    })

    ;(exps || []).forEach((exp: any) => {
      const paidKey = exp.paid_by_user_id || exp.paid_by_guest_name || ''
      if (bal[paidKey]) bal[paidKey].net += exp.amount
      ;(exp.splits || []).forEach((split: any) => {
        const splitKey = split.user_id || split.guest_name || ''
        if (bal[splitKey]) bal[splitKey].net -= split.amount
      })
    })

    setBalances(Object.values(bal))
    setLoading(false)
  }, [groupId, supabase])

  useEffect(() => { load() }, [load])

  async function copyInviteLink() {
    if (!group) return
    const url = `${window.location.origin}/join/${group.invite_token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast({ variant: 'success', title: t.linkCopied })
    setTimeout(() => setCopied(false), 2000)
  }

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!expForm.amount || !expForm.description || !expForm.paidBy) return
    setSaving(true)

    const perPerson = expForm.amount / members.length
    const paidByMember = members.find(m => m.user_id === expForm.paidBy || m.guest_name === expForm.paidBy)

    const { data: expense, error } = await supabase
      .from('group_expenses')
      .insert({
        group_id: groupId,
        paid_by_user_id: paidByMember?.user_id || null,
        paid_by_guest_name: paidByMember?.guest_name || null,
        description: expForm.description,
        amount: expForm.amount,
        date: expForm.date,
      })
      .select().single()

    if (error || !expense) {
      toast({ variant: 'destructive', title: t.error })
      setSaving(false)
      return
    }

    // Create splits for all members
    const splits = members.map(m => ({
      expense_id: expense.id,
      user_id: m.user_id || null,
      guest_name: m.guest_name || null,
      amount: perPerson,
      settled: false,
    }))
    await supabase.from('group_expense_splits').insert(splits)

    toast({ variant: 'success', title: 'Gasto adicionado!' })
    setShowExpense(false)
    setExpForm({ description: '', amount: null, paidBy: currentUserId || '', date: format(new Date(), 'yyyy-MM-dd') })
    load()
    setSaving(false)
  }

  const getMemberName = (exp: GroupExpense) => {
    if (exp.paid_by_user_id) {
      const m = members.find(m => m.user_id === exp.paid_by_user_id) as any
      return m?.profile?.name || 'Usuário'
    }
    return exp.paid_by_guest_name || 'Convidado'
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  if (loading) return (
    <div className="safe-top px-5">
      <div className="h-8 w-40 rounded-xl skeleton mt-4 mb-6" />
      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl skeleton" />)}</div>
    </div>
  )

  if (!group) return null

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={`${group.emoji} ${group.name}`}
        back
        right={
          <Button size="sm" variant="outline" onClick={copyInviteLink}>
            {copied ? <Check className="w-4 h-4 mr-1.5 text-[#34C759]" /> : <Copy className="w-4 h-4 mr-1.5" />}
            {copied ? t.linkCopied : t.copyLink}
          </Button>
        }
      />

      <div className="px-5">
        <Tabs defaultValue="expenses">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="expenses" className="flex-1">
              <Receipt className="w-4 h-4 mr-1.5" />{t.groupExpenses}
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex-1">
              <Scale className="w-4 h-4 mr-1.5" />{t.balances}
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1">
              <Users className="w-4 h-4 mr-1.5" />{t.members}
            </TabsTrigger>
          </TabsList>

          {/* EXPENSES */}
          <TabsContent value="expenses">
            <div className="mb-4 p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50">
              <p className="text-sm text-muted-foreground">{t.totalExpenses}</p>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              {members.length > 0 && (
                <p className="text-sm text-muted-foreground">{formatCurrency(totalExpenses / members.length)} {t.perPerson}</p>
              )}
            </div>

            <Button className="w-full mb-4" onClick={() => setShowExpense(true)}>
              <Plus className="w-5 h-5 mr-2" />{t.addExpense}
            </Button>

            {expenses.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{t.noExpenses}</p>
              </div>
            ) : expenses.map(exp => (
              <div key={exp.id} className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#AF52DE]/10 flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-5 h-5 text-[#AF52DE]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] truncate">{exp.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.paidBy} {getMemberName(exp)} · {formatDate(exp.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold">{formatCurrency(exp.amount)}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(exp.amount / members.length)} cada</p>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* BALANCES */}
          <TabsContent value="balances">
            <div className="space-y-2">
              {balances.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold text-sm">
                      {b.name[0]?.toUpperCase()}
                    </div>
                    <p className="font-medium">{b.name} {b.userId === currentUserId ? '(você)' : ''}</p>
                  </div>
                  <div className={cn('font-semibold', b.net > 0 ? 'text-[#34C759]' : b.net < 0 ? 'text-[#FF3B30]' : 'text-muted-foreground')}>
                    {b.net > 0 ? '+' : ''}{formatCurrency(b.net)}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Verde = a receber · Vermelho = a pagar
            </p>
          </TabsContent>

          {/* MEMBERS */}
          <TabsContent value="members">
            <div className="space-y-2">
              {members.map((m: any, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {(m.profile?.name || m.guest_name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{m.profile?.name || m.guest_name || 'Convidado'}</p>
                    <p className="text-xs text-muted-foreground">{m.role === 'admin' ? 'Admin' : 'Membro'} {m.user_id === currentUserId ? '· você' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add expense dialog */}
      <Dialog open={showExpense} onOpenChange={open => !open && setShowExpense(false)}>
        <DialogContent>
          <form onSubmit={addExpense} className="space-y-4">
            <h2 className="text-[17px] font-semibold">{t.addExpense}</h2>
            <div className="space-y-2">
              <Label>{t.description}</Label>
              <Input placeholder="Ex: Jantar, Airbnb, Gasolina..." value={expForm.description} onChange={e => setExpForm(f => ({...f, description: e.target.value}))} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label>{t.amount}</Label>
              <CurrencyInput value={expForm.amount} onChange={v => setExpForm(f => ({...f, amount: v}))} size="large" />
            </div>
            <div className="space-y-2">
              <Label>{t.paidBy}</Label>
              <Select value={expForm.paidBy} onValueChange={v => setExpForm(f => ({...f, paidBy: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {members.map((m: any, i) => (
                    <SelectItem key={i} value={m.user_id || m.guest_name || ''}>
                      {m.profile?.name || m.guest_name || 'Convidado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.date}</Label>
              <Input type="date" value={expForm.date} onChange={e => setExpForm(f => ({...f, date: e.target.value}))} />
            </div>
            {expForm.amount && members.length > 0 && (
              <div className="p-3 bg-secondary rounded-xl text-sm text-center text-muted-foreground">
                {t.splitEqually}: <strong className="text-foreground">{formatCurrency(expForm.amount / members.length)}</strong> por pessoa
              </div>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowExpense(false)} className="flex-1">{t.cancel}</Button>
              <Button type="submit" disabled={saving || !expForm.amount || !expForm.description} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
