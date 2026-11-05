import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-[52px] w-full rounded-2xl bg-secondary dark:bg-white/[0.06] dark:ring-1 dark:ring-inset dark:ring-white/[0.14] px-4 py-2 text-[16px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 dark:focus-visible:ring-white/40 focus-visible:ring-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'
export { Input }
