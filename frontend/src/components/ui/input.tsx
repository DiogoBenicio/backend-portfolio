import { cn } from '@/lib/utils/cn'
import React from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        'flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)

Input.displayName = 'Input'
