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
import { Plus, Copy, Check, Users, Receipt, Scale, Loader2, UserPlus, Mail, Trash2, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

interface Member {
  id: string
  group_id: string
  user_id: string | null
  guest_name: string | null
  role: string
  display_name: string
}

interface Expense {
  id: string
  paid_by_user_id: string | null
  paid_by_guest_name: string | null
  description: string
  amount: number
  date: string
  splits: { user_id: string | null; guest_name: string | null; amount: number }[]
}

interface Balance {
  key: string
  name: string
  userId: string | null
  net: number
}

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
  const [groupName, setGroupName] = useState('')
  const [groupEmoji, setGroupEmoji] = useState('👥')
  const [inviteToken, setInviteToken] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showExpense, setShowExpense] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [createdBy, setCreatedBy] = useState<string | null>(null)
  const [showLeave, setShowLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const router = useRouter()

  const [expForm, setExpForm] = useState({
    description: '',
    amount: null as number | null,
    paidBy: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  const supabase = createClient()
  const { t } = useI18n()
  const { groupId } = params

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    const { data: grp } = await supabase
      .from('groups').select('name, emoji, invite_token, created_by')
      .eq('id', groupId).single()

    if (grp) { setGroupName(grp.name); setGroupEmoji(grp.emoji); setInviteToken(grp.invite_token); setCreatedBy(grp.created_by) }

    // Load members with names
    const { data: memberRows } = await supabase
      .from('group_members').select('id, group_id, user_id, guest_name, role')
      .eq('group_id', groupId)

    const resolved: Member[] = []
    for (const m of (memberRows || [])) {
      let displayName = m.guest_name || 'Convidado'
      if (m.user_id) {
        const { data: profile } = await supabase
          .from('profiles').select('name').eq('user_id', m.user_id).single()
        displayName = profile?.name || 'Usuário'
      }
      resolved.push({ ...m, display_name: displayName })
    }
    setMembers(resolved)

    const current = resolved.find(m => m.user_id === user.id)
    if (current) setExpForm(f => ({ ...f, paidBy: current.id }))

    // Load expenses
    const { data: expRows } = await supabase
      .from('group_expenses')
      .select('*, splits:group_expense_splits(*)')
      .eq('group_id', groupId)
      .order('date', { ascending: false })

    setExpenses(expRows || [])

    // Calculate balances
    const bal: Record<string, Balance> = {}
    resolved.forEach(m => {
      const key = m.user_id || m.guest_name || m.id
      bal[key] = { key, name: m.display_name, userId: m.user_id, net: 0 }
    })
    ;(expRows || []).forEach((exp: any) => {
      const paidKey = exp.paid_by_user_id || exp.paid_by_guest_name || ''
      if (bal[paidKey]) bal[paidKey].net += exp.amount
      ;(exp.splits || []).forEach((s: any) => {
        const splitKey = s.user_id || s.guest_name || ''
        if (bal[splitKey]) bal[splitKey].net -= s.amount
      })
    })
    setBalances(Object.values(bal))
    setLoading(false)
  }, [groupId, supabase])

  useEffect(() => { load() }, [load])

  const isAdmin =
    !!currentUserId &&
    (createdBy === currentUserId || members.some(m => m.user_id === currentUserId && m.role === 'admin'))

  async function handleLeaveOrDelete() {
    if (!currentUserId) return
    setLeaving(true)
    if (isAdmin) {
      const { data, error } = await supabase.from('groups').delete().eq('id', groupId).select('id')
      if (error || !data || data.length === 0) {
        toast({ variant: 'destructive', title: 'Não foi possível excluir o grupo', description: 'Rode o SQL 005 no Supabase.' })
        setLeaving(false); return
      }
      toast({ variant: 'success', title: 'Grupo excluído' })
    } else {
      const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', currentUserId)
      if (error) { toast({ variant: 'destructive', title: t.error }); setLeaving(false); return }
      toast({ variant: 'success', title: 'Você saiu do grupo' })
    }
    router.push('/groups')
    router.refresh()
  }

  async function copyInviteLink() {
    const url = `${window.location.origin}/join/${inviteToken}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast({ variant: 'success', title: t.linkCopied })
    setTimeout(() => setCopied(false), 2000)
  }

  async function sendEmailInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setSendingInvite(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('group_invites').insert({
      group_id: groupId,
      invited_by: user.id,
      invited_email: inviteEmail.trim().toLowerCase(),
      status: 'pending',
    })

    if (error) {
      if (error.code === '23505') {
        toast({ variant: 'destructive', title: 'Já enviado', description: 'Esse e-mail já tem um convite pendente para este grupo.' })
      } else {
        toast({ variant: 'destructive', title: t.error, description: error.message })
      }
    } else {
      toast({ variant: 'success', title: 'Convite enviado!', description: `${inviteEmail} receberá o convite ao abrir o app.` })
      setInviteEmail('')
      setShowInvite(false)
    }
    setSendingInvite(false)
  }

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    if (!expForm.amount || !expForm.description || !expForm.paidBy) return
    setSaving(true)

    const paidByMember = members.find(m => m.id === expForm.paidBy)
    if (!paidByMember) { setSaving(false); return }

    const perPerson = expForm.amount / members.length

    const { data: expense, error } = await supabase.from('group_expenses').insert({
      group_id: groupId,
      paid_by_user_id: paidByMember.user_id || null,
      paid_by_guest_name: paidByMember.guest_name || null,
      description: expForm.description,
      amount: expForm.amount,
      date: expForm.date,
    }).select().single()

    if (error || !expense) { toast({ variant: 'destructive', title: t.error }); setSaving(false); return }

    await supabase.from('group_expense_splits').insert(
      members.map(m => ({
        expense_id: expense.id,
        user_id: m.user_id || null,
        guest_name: m.guest_name || null,
        amount: perPerson,
        settled: false,
      }))
    )

    toast({ variant: 'success', title: 'Gasto adicionado!' })
    setShowExpense(false)
    setExpForm(f => ({ ...f, description: '', amount: null }))
    load()
    setSaving(false)
  }

  const getPaidByName = (exp: Expense) => {
    if (exp.paid_by_user_id) return members.find(m => m.user_id === exp.paid_by_user_id)?.display_name || 'Alguém'
    return members.find(m => m.guest_name === exp.paid_by_guest_name)?.display_name || exp.paid_by_guest_name || 'Alguém'
  }

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  if (loading) return (
    <div className="safe-top px-5 space-y-3 pt-4">
      <div className="h-8 w-48 rounded-xl skeleton" />
      <div className="h-24 rounded-[22px] skeleton" />
      <div className="h-20 rounded-[22px] skeleton" />
    </div>
  )

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={groupName}
        back
        right={
          <div className="flex gap-2">
            <Button size="icon" variant="outline" className="w-9 h-9" onClick={() => setShowInvite(true)} aria-label="Convidar">
              <UserPlus className="w-4 h-4" strokeWidth={1.8} />
            </Button>
            <Button size="icon" variant="outline" className="w-9 h-9" onClick={copyInviteLink} aria-label="Copiar link">
              {copied ? <Check className="w-4 h-4 text-income" /> : <Copy className="w-4 h-4" strokeWidth={1.8} />}
            </Button>
            <Button size="icon" variant="outline" className="w-9 h-9" onClick={() => setShowLeave(true)}
              aria-label={isAdmin ? 'Excluir grupo' : 'Sair do grupo'}>
              {isAdmin ? <Trash2 className="w-4 h-4" strokeWidth={1.8} /> : <LogOut className="w-4 h-4" strokeWidth={1.8} />}
            </Button>
          </div>
        }
      />

      <div className="px-5">
        <Tabs defaultValue="expenses">
          <TabsList className="w-full mb-4 h-11">
            <TabsTrigger value="expenses" className="flex-1 text-xs">
              <Receipt className="w-3.5 h-3.5 mr-1" />Gastos
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex-1 text-xs">
              <Scale className="w-3.5 h-3.5 mr-1" />Saldos
            </TabsTrigger>
            <TabsTrigger value="members" className="flex-1 text-xs">
              <Users className="w-3.5 h-3.5 mr-1" />Membros
            </TabsTrigger>
          </TabsList>

          {/* EXPENSES */}
          <TabsContent value="expenses">
            <div className="mb-3 p-5 glass-card rounded-[22px]">
              <p className="section-label">{t.totalExpenses}</p>
              <p className="text-[32px] font-bold tracking-[-1px] mt-1 tabular-nums">{formatCurrency(totalExpenses)}</p>
              {members.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(totalExpenses / members.length)} {t.perPerson}
                </p>
              )}
            </div>
            <Button className="w-full mb-3" onClick={() => setShowExpense(true)}>
              <Plus className="w-5 h-5 mr-2" />{t.addExpense}
            </Button>
            {expenses.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">{t.noExpenses}</p>
              </div>
            ) : expenses.map(exp => (
              <div key={exp.id} className="flex items-center gap-3.5 p-4 glass-card rounded-[22px] mb-2">
                <div className="icon-tile"><Receipt className="w-5 h-5" strokeWidth={1.8} /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] truncate">{exp.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.paidBy} {getPaidByName(exp)} · {formatDate(exp.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold">{formatCurrency(exp.amount)}</p>
                  {members.length > 0 && (
                    <p className="text-xs text-muted-foreground">{formatCurrency(exp.amount / members.length)} cada</p>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* BALANCES */}
          <TabsContent value="balances">
            <div className="space-y-2">
              {balances.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 glass-card rounded-[22px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold">
                      {b.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{b.name}</p>
                      {b.userId === currentUserId && <p className="text-xs text-muted-foreground">você</p>}
                    </div>
                  </div>
                  <p className={cn('font-semibold text-[15px]',
                    b.net > 0.01 ? 'text-income' : b.net < -0.01 ? 'text-warn' : 'text-muted-foreground'
                  )}>
                    {b.net > 0.01 ? '+' : ''}{formatCurrency(b.net)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Verde: a receber · Laranja: a pagar</p>
          </TabsContent>

          {/* MEMBERS */}
          <TabsContent value="members">
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-4 glass-card rounded-[22px]">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold">
                    {m.display_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{m.display_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.role === 'admin' ? 'Admin' : 'Membro'}
                      {!m.user_id && ' · convidado'}
                      {m.user_id === currentUserId && ' · você'}
                    </p>
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
            <h2 className="text-[20px] font-bold tracking-tight">{t.addExpense}</h2>
            <div className="space-y-2">
              <Label>{t.description}</Label>
              <Input placeholder="Ex: Jantar, Airbnb, Gasolina..." value={expForm.description}
                onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} required autoFocus />
            </div>
            <div className="space-y-2">
              <Label>{t.amount}</Label>
              <CurrencyInput value={expForm.amount} onChange={v => setExpForm(f => ({ ...f, amount: v }))} size="large" />
            </div>
            <div className="space-y-2">
              <Label>{t.paidBy}</Label>
              <Select value={expForm.paidBy} onValueChange={v => setExpForm(f => ({ ...f, paidBy: v }))}>
                <SelectTrigger><SelectValue placeholder="Quem pagou?" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m.id} value={m.id}>{m.display_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.date}</Label>
              <Input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            {expForm.amount && members.length > 0 && (
              <div className="p-3 bg-secondary rounded-2xl text-sm text-center text-muted-foreground">
                Dividindo igualmente: <strong className="text-foreground">{formatCurrency(expForm.amount / members.length)}</strong> por pessoa
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

      {/* Invite by email dialog */}
      <Dialog open={showInvite} onOpenChange={open => !open && setShowInvite(false)}>
        <DialogContent>
          <form onSubmit={sendEmailInvite} className="space-y-4">
            <div>
              <h2 className="text-[20px] font-bold tracking-tight">Convidar por e-mail</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Se a pessoa tiver conta no Map Cash, o convite aparecerá para ela ao abrir o app.
              </p>
            </div>
            <div className="space-y-2">
              <Label>E-mail do usuário</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="amigo@email.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowInvite(false)} className="flex-1">
                {t.cancel}
              </Button>
              <Button type="submit" disabled={sendingInvite || !inviteEmail.trim()} className="flex-1">
                {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar convite'}
              </Button>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Ou compartilhe o link de convite:</p>
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={copyInviteLink}>
                {copied ? <><Check className="w-4 h-4 mr-2 text-income" />Link copiado!</> : <><Copy className="w-4 h-4 mr-2" />Copiar link de convite</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showLeave} onOpenChange={open => !open && setShowLeave(false)}>
        <DialogContent>
          <div className="space-y-4">
            <h2 className="text-[20px] font-bold tracking-tight">{isAdmin ? 'Excluir grupo?' : 'Sair do grupo?'}</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? <>O grupo <strong className="text-foreground">{groupName}</strong> será apagado para todos os membros, com gastos e saldos. Isso não pode ser desfeito.</>
                : <>Você deixa de ver o grupo <strong className="text-foreground">{groupName}</strong>. Os gastos já lançados continuam para os outros membros.</>}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowLeave(false)} className="flex-1">{t.cancel}</Button>
              <Button type="button" variant="destructive" onClick={handleLeaveOrDelete} disabled={leaving} className="flex-1">
                {leaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isAdmin ? 'Excluir' : 'Sair'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
