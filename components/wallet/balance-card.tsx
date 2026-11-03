'use client'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const { t } = useI18n()

  return (
    <div className="bg-card rounded-[26px] p-6">
      <p className="section-label">{t.thisMonth}</p>
      <p className="numeral mt-2 text-foreground">{formatCurrency(balance)}</p>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="rounded-2xl bg-secondary/70 p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ArrowDownLeft className="w-4 h-4 text-income" strokeWidth={2} />
            <span className="text-[12px] font-medium">{t.income}</span>
          </div>
          <p className="mt-1.5 text-[19px] font-semibold tracking-tight text-income tabular-nums">
            {formatCurrency(income)}
          </p>
        </div>
        <div className="rounded-2xl bg-secondary/70 p-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
            <span className="text-[12px] font-medium">{t.expenses}</span>
          </div>
          <p className="mt-1.5 text-[19px] font-semibold tracking-tight text-foreground tabular-nums">
            {formatCurrency(expenses)}
          </p>
        </div>
      </div>
    </div>
  )
}
