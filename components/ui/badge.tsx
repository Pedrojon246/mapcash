import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-foreground',
        income: 'bg-income/15 text-income',
        expense: 'bg-secondary text-foreground',
        warning: 'bg-warn/15 text-warn',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border border-border text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
