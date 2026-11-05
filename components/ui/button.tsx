import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-90',
        destructive: 'bg-destructive/15 text-destructive hover:bg-destructive/25',
        outline: 'bg-secondary text-foreground hover:bg-accent dark:bg-white/[0.06] dark:ring-1 dark:ring-inset dark:ring-white/[0.16]',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent dark:bg-white/[0.07] dark:ring-1 dark:ring-inset dark:ring-white/[0.14]',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[52px] px-6 rounded-2xl text-[16px]',
        sm: 'h-9 px-4 rounded-full text-[13px]',
        lg: 'h-14 px-8 rounded-2xl text-[17px]',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'
export { Button, buttonVariants }
