'use client'
import { formatCurrency } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const { t } = useI18n()
  const isPositive = balance >= 0

  return (
    <div className="relative overflow-hidden rounded-[24px] p-6"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.16)',
      }}
    >
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%), radial-gradient(circle at 20% 80%, #fff 0%, transparent 40%)',
        }}
      />

      {/* Month label */}
      <p className="text-white/50 text-[12px] font-medium tracking-widest uppercase mb-1 relative">
        {t.thisMonth}
      </p>

      {/* Main balance */}
      <p className="text-white relative"
        style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1 }}
      >
        {formatCurrency(balance)}
      </p>

      {/* Positive/negative indicator */}
      <div className="flex items-center gap-1.5 mt-1 mb-6 relative">
        <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <p className={`text-[12px] font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? 'Saldo positivo' : 'Saldo negativo'}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-5 relative" />

      {/* Income / Expenses */}
      <div className="flex gap-4 relative">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 8V2M2 5L5 2L8 5" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-white/50 text-[11px] font-medium tracking-wide">{t.income}</p>
          </div>
          <p className="text-emerald-400 font-semibold" style={{ fontSize: '18px', letterSpacing: '-0.3px' }}>
            {formatCurrency(income)}
          </p>
        </div>

        <div className="w-px bg-white/10" />

        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 2V8M8 5L5 8L2 5" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-white/50 text-[11px] font-medium tracking-wide">{t.expenses}</p>
          </div>
          <p className="text-red-400 font-semibold" style={{ fontSize: '18px', letterSpacing: '-0.3px' }}>
            {formatCurrency(expenses)}
          </p>
        </div>
      </div>
    </div>
  )
}
