'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { RateLimitProvider } from '@/context/RateLimitContext'
import { isRateLimitError } from '@/lib/errors'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (_, error) => !isRateLimitError(error),
            throwOnError: (error) => !isRateLimitError(error),
          },
        },
      })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <RateLimitProvider>{children}</RateLimitProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
