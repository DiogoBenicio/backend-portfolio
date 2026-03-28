'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export function RateLimitModal() {
  const { visible, retryAfter, show, hide } = useRateLimit()
  const router = useRouter()
  const [seconds, setSeconds] = useState<number | null>(null)

  useEffect(() => {
    function handleRateLimit(e: Event) {
      const detail = (e as CustomEvent<{ retryAfter?: string }>).detail
      show(detail?.retryAfter)
    }
    window.addEventListener('rate-limit', handleRateLimit)
    return () => window.removeEventListener('rate-limit', handleRateLimit)
  }, [show])

  // Countdown baseado no retryAfter (pode ser "Xs" ou número de segundos)
  useEffect(() => {
    if (!visible || !retryAfter) { setSeconds(null); return }

    const raw = parseInt(retryAfter, 10)
    if (isNaN(raw)) { setSeconds(null); return }

    setSeconds(raw)
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s === null || s <= 1) { clearInterval(interval); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [visible, retryAfter])

  function goToNps() {
    hide()
    router.push('/dashboard/nps')
  }

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && hide()}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader className="items-center gap-3">
          {/* Ícone principal */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/20">
            <Heart className="h-8 w-8 text-pink-500" fill="currentColor" />
          </div>

          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-slate-100">
            Obrigado por explorar!
          </DialogTitle>

          <DialogDescription className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
            Você explorou bastante o portfólio — que ótimo! O limite de
            requisições foi atingido para proteger a demo.
            <br /><br />
            Que tal deixar uma avaliação no <strong className="text-gray-700 dark:text-slate-200">NPS</strong>? Seu feedback
            é muito importante para mim!
          </DialogDescription>
        </DialogHeader>

        {/* Countdown */}
        {seconds !== null && seconds > 0 && (
          <div className="mx-auto flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Disponível novamente em <strong className="tabular-nums">{seconds}s</strong></span>
          </div>
        )}
        {seconds === 0 && (
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
            Pronto! Pode continuar explorando.
          </p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={goToNps} className="w-full gap-2 bg-pink-500 hover:bg-pink-600 text-white">
            <MessageSquareHeart className="h-4 w-4" />
            Deixar avaliação no NPS
          </Button>
          <Button variant="outline" onClick={hide} className="w-full">
            Voltar a explorar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
