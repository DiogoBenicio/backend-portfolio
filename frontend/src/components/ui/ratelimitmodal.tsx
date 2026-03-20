'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRateLimit } from '@/context/RateLimitContext'

export function RateLimitModal() {
  const { visible, retryAfter, show, hide } = useRateLimit()
  const router = useRouter()

  // Escuta o evento global disparado pelos axios interceptors
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
    <Dialog open={visible} onOpenChange={(open) => !open && hide()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-500 shrink-0" />
            <DialogTitle className="text-lg">Muitas requisições!</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Você está navegando rápido demais. Que tal avaliar o portfólio enquanto aguarda? 😄
          </DialogDescription>
        </DialogHeader>

        {retryAfter && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Tente novamente em:</span>
            <Badge variant="secondary">{retryAfter}</Badge>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={goToNps} className="w-full sm:w-auto">
            Avaliar com NPS
          </Button>
          <Button variant="outline" onClick={hide} className="w-full sm:w-auto">
            Ok, entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
