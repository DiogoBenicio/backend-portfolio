'use client'

import { createContext, useContext, useState } from 'react'

interface RateLimitState {
  visible: boolean
  retryAfter?: string
  show: (retryAfter?: string) => void
  hide: () => void
}

const RateLimitContext = createContext<RateLimitState>({
  visible: false,
  show: () => {},
  hide: () => {},
})

export function RateLimitProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [retryAfter, setRetryAfter] = useState<string | undefined>()

  function show(after?: string) {
    setRetryAfter(after)
    setVisible(true)
  }

  function hide() {
    setVisible(false)
    setRetryAfter(undefined)
  }

  return (
    <RateLimitContext.Provider value={{ visible, retryAfter, show, hide }}>
      {children}
    </RateLimitContext.Provider>
  )
}

export function useRateLimit() {
  return useContext(RateLimitContext)
}
