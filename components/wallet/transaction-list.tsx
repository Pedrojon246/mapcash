'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, CATEGORY_EMOJIS, CATEGORY_COLORS, cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'
import { toast } from '@/components/ui/use-toast'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Transaction } from '@/lib/supabase/types'
import { Trash2, Pencil, Receipt } from 'lucide-react'

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
        <div key={i} className="h-16 rounded-2xl skeleton" />
      ))}
    </div>
  )

  if (transactions.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <Receipt className="w-8 h-8 text-muted-foreground" />
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
      <div className="space-y-4 pb-4">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {formatDate(date)}
            </p>
            <div className="space-y-2">
              {txs.map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-4 bg-card rounded-2xl shadow-apple-sm border border-border/50 pressable group"
                  onClick={() => onEdit(tx)}
                >
                  {/* Category icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: CATEGORY_COLORS[tx.category] + '20' }}
                  >
                    {CATEGORY_EMOJIS[tx.category]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px] truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t.categories[tx.category as keyof typeof t.categories]}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      'font-semibold text-[15px]',
                      tx.type === 'income' ? 'text-[#34C759]' : 'text-foreground'
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteId(tx.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
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
