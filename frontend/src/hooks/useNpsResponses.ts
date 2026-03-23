import { useQuery } from '@tanstack/react-query'
import { npsApi } from '@/lib/api/npsClient'

export function useNpsResponses(page = 'portfolio', limit = 20) {
  return useQuery({
    queryKey: ['nps-responses', page, limit],
    queryFn: () => npsApi.listResponses({ page, limit, offset: 0 }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
