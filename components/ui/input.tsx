import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('border rounded px-3 py-2', className || '')} {...props} />
}
