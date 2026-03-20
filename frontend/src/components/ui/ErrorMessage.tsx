import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({
  message = 'Erro ao carregar dados.',
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700',
        className
      )}
    >
      <AlertCircle size={18} />
      <span className="text-sm">{message}</span>
    </div>
  )
}
