'use client'
import { useToast } from './use-toast'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map(t => (
        <div key={t.id} className="glass flex items-center gap-3 rounded-2xl px-4 py-3.5 border border-border animate-slide-up shadow-2xl shadow-black/30">
          {t.variant === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-income" strokeWidth={1.8} />}
          {t.variant === 'destructive' && <AlertCircle className="w-5 h-5 flex-shrink-0 text-destructive" strokeWidth={1.8} />}
          <div className="flex-1 min-w-0">
            {t.title && <p className="text-[14px] font-semibold text-foreground">{t.title}</p>}
            {t.description && <p className="text-[12px] text-muted-foreground">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
