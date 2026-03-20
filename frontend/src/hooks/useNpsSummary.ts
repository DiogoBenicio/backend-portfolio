import { useQuery } from '@tanstack/react-query'
import { npsApi } from '@/lib/api/npsClient'

export function useNpsSummary(page?: string) {
  return useQuery({
    queryKey: ['nps', 'summary', page],
    queryFn: () => npsApi.getSummary(page),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // refetch a cada 1 minuto
  })
}
