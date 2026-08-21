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
    <div className={cn('flex items-center justify-between px-5 pt-4 pb-2', className)}>
      <div className="flex items-center gap-2 min-w-0">
        {back && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-0.5 text-primary font-medium text-[15px] pressable mr-1 flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className={cn(
            'font-bold tracking-tight truncate',
            large ? 'text-3xl' : 'text-xl'
          )}>
            {title}
          </h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex-shrink-0 ml-3">{right}</div>}
    </div>
  )
}
