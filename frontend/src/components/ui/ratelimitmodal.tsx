'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { AlertTriangle, MessageSquareHeart, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRateLimit } from '@/context/RateLimitContext'

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function RateLimitModal() {
  const { isBlocked, timeRemaining, show, hide } = useRateLimit()
  const router = useRouter()
  const pathname = usePathname()

  const shouldShow = isBlocked && pathname !== '/dashboard/nps'

  // Dispara o modal apenas em respostas 429 reais da API
  useEffect(() => {
    function handleRateLimit(e: Event) {
      const detail = (e as CustomEvent<{ retryAfter?: string }>).detail
      show(detail?.retryAfter)
    }
    window.addEventListener('rate-limit', handleRateLimit)
    return () => window.removeEventListener('rate-limit', handleRateLimit)
  }, [show])

  function goToNps() {
    hide()
    router.push('/dashboard/nps')
  }

  return (
    <Dialog open={shouldShow} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm text-center [&>button:last-child]:hidden">
        <DialogHeader className="items-center gap-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-slate-100">
            Limite de requisições atingido
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
            A API retornou um erro{' '}
            <strong className="text-gray-700 dark:text-slate-200">429 — Too Many Requests</strong>.
            <br />
            <br />
            Isso acontece quando muitas chamadas são feitas em pouco tempo. O acesso será liberado
            automaticamente em instantes. Aproveite para deixar sua avaliação no{' '}
            <strong className="text-gray-700 dark:text-slate-200">NPS</strong>!
          </DialogDescription>
        </DialogHeader>

        {timeRemaining > 0 && (
          <div className="mx-auto flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              Disponível novamente em{' '}
              <strong className="tabular-nums">{formatTime(timeRemaining)}</strong>
            </span>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={goToNps}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageSquareHeart className="h-4 w-4" />
            Deixar minha avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
