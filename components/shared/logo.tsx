import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Logo({ size = 72, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn('bg-primary text-primary-foreground flex items-center justify-center', className)}
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    >
      <MapPin style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={1.8} />
    </div>
  )
}
