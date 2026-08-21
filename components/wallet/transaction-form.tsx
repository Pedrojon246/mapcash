'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { toast } from '@/components/ui/use-toast'
import { useI18n } from '@/lib/i18n/context'
import { CATEGORY_EMOJIS } from '@/lib/utils'
import type { Transaction, Category } from '@/lib/supabase/types'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

interface TransactionFormProps {
  transaction?: Transaction | null
  onSaved: () => void
  onCancel: () => void
}

const CATEGORIES: Category[] = ['food','transport','housing','health','education','entertainment','shopping','travel','salary','freelance','investment','other']

export function TransactionForm({ transaction, onSaved, onCancel }: TransactionFormProps) {
  const { t } = useI18n()
  const supabase = createClient()
  const isEdit = !!transaction

  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [amount, setAmount] = useState<number | null>(transaction?.amount || null)
  const [description, setDescription] = useState(transaction?.description || '')
  const [category, setCategory] = useState<Category>(transaction?.category || 'other')
  const [date, setDate] = useState(transaction?.date || format(new Date(), 'yyyy-MM-dd'))
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { type, amount, description, category, date, user_id: user.id }

    const { error } = isEdit
      ? await supabase.from('transactions').update(payload).eq('id', transaction!.id)
      : await supabase.from('transactions').insert(payload)

    if (error) {
      toast({ variant: 'destructive', title: t.error, description: error.message })
    } else {
      toast({ variant: 'success', title: isEdit ? 'Lançamento atualizado' : 'Lançamento adicionado' })
      onSaved()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-[17px] font-semibold">
        {isEdit ? t.edit : t.addTransaction}
      </h2>

      {/* Type toggle */}
      <div className="flex gap-2 p-1 bg-secondary rounded-xl">
        {(['expense', 'income'] as const).map(tp => (
          <button
            key={tp}
            type="button"
            onClick={() => setType(tp)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              type === tp
                ? tp === 'expense'
                  ? 'bg-[#FF3B30] text-white shadow-apple-sm'
                  : 'bg-[#34C759] text-white shadow-apple-sm'
                : 'text-muted-foreground'
            }`}
          >
            {tp === 'expense' ? t.expenseType : t.incomeType}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label>{t.amount}</Label>
        <CurrencyInput value={amount} onChange={setAmount} size="large" autoFocus />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>{t.description}</Label>
        <Input
          placeholder={type === 'expense' ? 'Ex: Supermercado, Uber...' : 'Ex: Salário, Freela...'}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>{t.category}</Label>
        <Select value={category} onValueChange={v => setCategory(v as Category)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>
                {CATEGORY_EMOJIS[c]} {t.categories[c as keyof typeof t.categories]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label>{t.date}</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          {t.cancel}
        </Button>
        <Button type="submit" disabled={loading || !amount} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save}
        </Button>
      </div>
    </form>
  )
}
