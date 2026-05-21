'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Heart, MessageSquareHeart, Clock } from 'lucide-react'
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

const GATED_ROUTES = ['/dashboard/weather', '/dashboard/map']

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
  const { isBlocked, timeRemaining, show, hide, startUsageTimer } = useRateLimit()
  const router = useRouter()
  const pathname = usePathname()

  const isGatedPage = GATED_ROUTES.some((r) => pathname.startsWith(r))
  const shouldShow = isBlocked && isGatedPage

  // Acumula tempo de uso apenas nas páginas com gate
  useEffect(() => {
    if (!isGatedPage) return
    const interval = setInterval(startUsageTimer, 10_000)
    return () => clearInterval(interval)
  }, [isGatedPage, startUsageTimer])

  // 429 da API não dispara mais o bloqueio de 1h — apenas o usage gate faz isso

  function goToNps() {
    hide()
    router.push('/dashboard/nps')
  }

  return (
    <Dialog open={shouldShow} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm text-center [&>button:last-child]:hidden">
        <DialogHeader className="items-center gap-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20">
            <Heart className="h-8 w-8 text-orange-500" fill="currentColor" />
          </div>

          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-slate-100">
            Obrigado por explorar!
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
            Você explorou bastante o portfólio — incrível! 🎉
            <br />
            <br />
            Para manter a demonstração saudável, o acesso ficará pausado por 1 hora. Aproveite para
            deixar sua avaliação no{' '}
            <strong className="text-gray-700 dark:text-slate-200">NPS</strong> — seu feedback é
            muito valioso!
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
            className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <MessageSquareHeart className="h-4 w-4" />
            Deixar minha avaliação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
