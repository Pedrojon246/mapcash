import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ size = 72, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('bg-primary text-primary-foreground flex items-center justify-center dark:bg-transparent dark:bg-gradient-to-br dark:from-white/25 dark:to-white/[0.04] dark:text-white dark:ring-1 dark:ring-inset dark:ring-white/30 dark:shadow-[0_8px_30px_rgba(56,104,214,0.35)]', className)}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <MapPin style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={1.8} />
    </div>
  )
}
