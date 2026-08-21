'use client'
import { formatCurrency } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const { t } = useI18n()

  return (
    <div className="rounded-3xl bg-primary p-6 text-white shadow-apple-lg">
      <p className="text-sm font-medium opacity-80 mb-1">{t.balance} · {t.thisMonth}</p>
      <p className="text-4xl font-bold tracking-tight mb-6">
        {formatCurrency(balance)}
      </p>
      <div className="flex gap-4">
        <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium opacity-80">{t.income}</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(income)}</p>
        </div>
        <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium opacity-80">{t.expenses}</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(expenses)}</p>
        </div>
      </div>
    </div>
  )
}
