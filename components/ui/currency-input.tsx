'use client'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface CurrencyInputProps {
  value: number | null
  onChange: (v: number | null) => void
  placeholder?: string
  className?: string
  currency?: string
  required?: boolean
  autoFocus?: boolean
  size?: 'default' | 'large'
}

export function CurrencyInput({
  value, onChange, placeholder = '0,00', className,
  currency = 'R$', required, autoFocus, size = 'default'
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => {
    if (!value) return ''
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value)
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) { setDisplay(''); onChange(null); return }
    const num = parseInt(raw, 10) / 100
    setDisplay(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(num))
    onChange(num)
  }, [onChange])

  return (
    <div className={cn('relative flex items-center', className)}>
      <span className={cn(
        'absolute left-4 text-muted-foreground font-medium select-none',
        size === 'large' ? 'text-2xl' : 'text-[15px]'
      )}>
        {currency}
      </span>
      <input
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        inputMode="numeric"
        required={required}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-2xl bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/40 transition-all font-semibold tracking-tight',
          size === 'large'
            ? 'h-16 pl-14 pr-4 text-3xl'
            : 'h-[52px] pl-12 pr-4 text-[16px]'
        )}
      />
    </div>
  )
}
