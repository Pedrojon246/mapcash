'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  back?: boolean
  right?: React.ReactNode
  className?: string
  large?: boolean
}

export function PageHeader({ title, subtitle, back, right, className, large }: PageHeaderProps) {
  const router = useRouter()
  return (
    <div className={cn('flex items-center justify-between px-5 pt-5 pb-3', className)}>
      <div className="flex items-center gap-2 min-w-0">
        {back && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-secondary text-foreground pressable mr-2 flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className={cn(
            'font-bold truncate',
            large ? 'text-[32px] leading-tight tracking-[-0.8px]' : 'text-[22px] tracking-[-0.4px]'
          )}>
            {title}
          </h1>
          {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex-shrink-0 ml-3">{right}</div>}
    </div>
  )
}
