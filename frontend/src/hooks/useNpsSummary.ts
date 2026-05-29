import { useQuery } from '@tanstack/react-query'
import { npsApi } from '@/lib/api/npsClient'

export function useNpsSummary(page?: string) {
  return useQuery({
    queryKey: ['nps', 'summary', page],
    queryFn: () => npsApi.getSummary(page),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: (query) => (query.state.status === 'error' ? false : 60_000),
  })
}
