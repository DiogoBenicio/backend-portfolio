'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RL_KEY = 'rl-blocked-until'

interface RateLimitState {
  visible: boolean
  isBlocked: boolean
  blockedUntil: number | null
  timeRemaining: number
  retryAfter?: string
  show: (retryAfter?: string) => void
  hide: () => void
  blockUser: () => void
}

const RateLimitContext = createContext<RateLimitState>({
  visible: false,
  isBlocked: false,
  blockedUntil: null,
  timeRemaining: 0,
  show: () => {},
  hide: () => {},
  blockUser: () => {},
})

export function RateLimitProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [retryAfter, setRetryAfter] = useState<string | undefined>()
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // Restore block state on mount
  useEffect(() => {
    const stored = localStorage.getItem(RL_KEY)
    if (stored) {
      const until = parseInt(stored, 10)
      if (!isNaN(until) && until > Date.now()) {
        setIsBlocked(true)
        setBlockedUntil(until)
      } else {
        localStorage.removeItem(RL_KEY)
      }
    }
  }, [])

  // Countdown ticker
  useEffect(() => {
    if (!isBlocked || blockedUntil === null) {
      setTimeRemaining(0)
      return
    }

    function tick() {
      const remaining = Math.ceil((blockedUntil! - Date.now()) / 1000)
      if (remaining <= 0) {
        setIsBlocked(false)
        setBlockedUntil(null)
        setTimeRemaining(0)
        setVisible(false)
        localStorage.removeItem(RL_KEY)
      } else {
        setTimeRemaining(remaining)
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [isBlocked, blockedUntil])

  const blockUser = useCallback(() => {
    // Se já há um bloco ativo, não resetar o countdown
    const stored = localStorage.getItem(RL_KEY)
    if (stored) {
      const existing = parseInt(stored, 10)
      if (!isNaN(existing) && existing > Date.now()) return
    }
    const until = Date.now() + 3_600_000
    localStorage.setItem(RL_KEY, String(until))
    setIsBlocked(true)
    setBlockedUntil(until)
  }, [])

  const show = useCallback(
    (after?: string) => {
      setRetryAfter(after)
      blockUser()
      setVisible(true)
    },
    [blockUser]
  )

  const hide = useCallback(() => {
    setVisible(false)
  }, [])

  return (
    <RateLimitContext.Provider
      value={{ visible, isBlocked, blockedUntil, timeRemaining, retryAfter, show, hide, blockUser }}
    >
      {children}
    </RateLimitContext.Provider>
  )
}

export function useRateLimit() {
  return useContext(RateLimitContext)
}
