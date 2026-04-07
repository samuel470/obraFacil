import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 h-11 px-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-emerald-500',
        secondary: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
        ghost: 'hover:bg-emerald-50 text-ink'
      }
    },
    defaultVariants: { variant: 'default' }
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, className }))} {...props} />
}
