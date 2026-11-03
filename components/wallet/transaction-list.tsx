'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { CategoryIcon } from '@/components/ui/icons'
import { useI18n } from '@/lib/i18n/context'
import { toast } from '@/components/ui/use-toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Transaction } from '@/lib/supabase/types'
import { Trash2, Receipt } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onEdit: (tx: Transaction) => void
  onDeleted: () => void
}

export function TransactionList({ transactions, loading, onEdit, onDeleted }: TransactionListProps) {
  const { t } = useI18n()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('transactions').delete().eq('id', deleteId)
    if (error) {
      toast({ variant: 'destructive', title: t.error })
    } else {
      toast({ variant: 'success', title: 'Lançamento excluído' })
      onDeleted()
    }
    setDeleteId(null)
    setDeleting(false)
  }

  if (loading) return (
    <div className="space-y-3 mt-2">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-[68px] rounded-[22px] skeleton" />
      ))}
    </div>
  )

  if (transactions.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center mb-4">
        <Receipt className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <p className="font-semibold text-foreground">{t.noTransactions}</p>
      <p className="text-sm text-muted-foreground mt-1">{t.noTransactionsDesc}</p>
    </div>
  )

  // Group by date
  const grouped = transactions.reduce((acc, tx) => {
    const key = tx.date
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {} as Record<string, Transaction[]>)

  return (
    <>
      <div className="space-y-5 pb-4">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="section-label mb-2 px-1">{formatDate(date)}</p>
            <div className="list-group">
              {txs.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3.5 px-4 py-3.5 pressable group"
                  onClick={() => onEdit(tx)}
                >
                  <div className="icon-tile">
                    <CategoryIcon category={tx.category} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px] truncate tracking-tight">{tx.description}</p>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                      {t.categories[tx.category as keyof typeof t.categories]}
                    </p>
                  </div>

                  <p className={cn(
                    'font-semibold text-[15px] tabular-nums tracking-tight flex-shrink-0',
                    tx.type === 'income' ? 'text-income' : 'text-foreground'
                  )}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                  </p>

                  <button
                    onClick={e => { e.stopPropagation(); setDeleteId(tx.id) }}
                    aria-label="Excluir"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
            <DialogDescription>{t.confirmDeleteDesc}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1">
              {t.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
