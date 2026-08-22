'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/layout/page-header'
import { TransactionForm } from '@/components/wallet/transaction-form'
import { TransactionList } from '@/components/wallet/transaction-list'
import { BalanceCard } from '@/components/wallet/balance-card'
import { Greeting } from '@/components/wallet/greeting'
import { Button } from '@/components/ui/button'
import { Plus, Settings } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useI18n } from '@/lib/i18n/context'
import type { Transaction } from '@/lib/supabase/types'
import { currentMonth } from '@/lib/utils'
import Link from 'next/link'

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTx, setEditTx] = useState<Transaction | null>(null)
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
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

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
          <Link href="/settings">
            <button className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground pressable">
              <Settings className="w-5 h-5" />
            </button>
          </Link>
        }
      />

      <div className="space-y-3">
        <Greeting />
        <div className="px-5 space-y-3">
          <BalanceCard balance={balance} income={income} expenses={expenses} />
          <Button onClick={handleAdd} className="w-full" size="lg">
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
          <TransactionForm
            transaction={editTx}
            onSaved={handleSaved}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
