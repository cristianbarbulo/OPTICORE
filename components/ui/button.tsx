import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn('px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50', className || '')}
      {...props}
    />
  )
}
