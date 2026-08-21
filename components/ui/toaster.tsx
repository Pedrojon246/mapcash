'use client'
import { useToast } from './use-toast'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, X } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map(t => (
        <div key={t.id} className={cn(
          'flex items-center gap-3 rounded-2xl px-4 py-3.5 shadow-apple-lg border animate-slide-up',
          t.variant === 'destructive' ? 'bg-[#FF3B30] text-white border-[#FF3B30]' :
          t.variant === 'success' ? 'bg-[#34C759] text-white border-[#34C759]' :
          'bg-card text-foreground border-border'
        )}>
          {t.variant === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {t.variant === 'destructive' && <XCircle className="w-5 h-5 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && <p className="text-xs opacity-80">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
