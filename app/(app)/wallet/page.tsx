'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { TransactionForm } from '@/components/wallet/transaction-form'
import { TransactionList } from '@/components/wallet/transaction-list'
import { BalanceCard } from '@/components/wallet/balance-card'
import { Greeting } from '@/components/wallet/greeting'
import { Button } from '@/components/ui/button'
import { Plus, Settings, BookOpen } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useI18n } from '@/lib/i18n/context'
import type { Transaction } from '@/lib/supabase/types'
import { format, startOfMonth, addMonths } from 'date-fns'
import Link from 'next/link'
import { useTutorial, useShowTutorial } from '@/lib/hooks/use-tutorial'
import { TutorialOverlay, TutorialsModal } from '@/components/shared/tutorial-overlay'

// Safe date range — never uses invalid dates like '2026-09-31'
function getMonthRange() {
  const now = new Date()
  const start = format(startOfMonth(now), 'yyyy-MM-dd')
  const end = format(startOfMonth(addMonths(now, 1)), 'yyyy-MM-dd')
  return { start, end }
}

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const supabaseRef = useRef(createClient())
  const { t } = useI18n()
  const { visible: tutVisible, dismiss, skipAll } = useTutorial('wallet')
  const { visible: tutModalVisible, open: openTutModal, close: closeTutModal } = useShowTutorial('wallet')

  const load = useCallback(async () => {
    const supabase = supabaseRef.current
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { start, end } = getMonthRange()

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', start)
      .lt('date', end)           // lt next month start = covers entire current month safely
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) console.error('Wallet load error:', error)
    setTransactions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Re-fetch when tab becomes visible again
    const handleVisibility = () => { if (!document.hidden) load() }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [load])

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expenses

  function handleAdd() { setEditTx(null); setShowForm(true) }
  function handleEdit(tx: Transaction) { setEditTx(tx); setShowForm(true) }
  function handleClose() { setShowForm(false); setEditTx(null) }
  function handleSaved() { handleClose(); load() }

  return (
    <div className="animate-fade-in safe-top">
      <PageHeader
        title={t.wallet}
        large
        right={
          <div className="flex items-center gap-2">
            <button onClick={openTutModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable text-[12px] font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              Tutoriais
            </button>
            <Link href="/settings">
              <button className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground pressable">
                <Settings className="w-4 h-4" />
              </button>
            </Link>
          </div>
        }
      />

      <div className="space-y-3">
        <Greeting />
        <div className="px-5 space-y-3">
          <BalanceCard balance={balance} income={income} expenses={expenses} />
          <Button
            onClick={handleAdd}
            className="w-full h-12 rounded-[14px] text-[15px] font-semibold"
            style={{ background: 'hsl(220, 13%, 18%)', color: 'white' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.addTransaction}
          </Button>
          <TransactionList
            transactions={transactions}
            loading={loading}
            onEdit={handleEdit}
            onDeleted={load}
          />
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={open => !open && handleClose()}>
        <DialogContent>
          <TransactionForm transaction={editTx} onSaved={handleSaved} onCancel={handleClose} />
        </DialogContent>
      </Dialog>

      <TutorialOverlay screen="wallet" visible={tutVisible} onDismiss={dismiss} onSkipAll={skipAll} />
      <TutorialsModal visible={tutModalVisible} onClose={closeTutModal} />
    </div>
  )
}
