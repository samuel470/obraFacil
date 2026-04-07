import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('h-11 w-full rounded-xl border border-emerald-100 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-200', className)} {...props} />
}
