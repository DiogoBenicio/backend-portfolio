import { useQuery } from '@tanstack/react-query'
import { weatherApi } from '@/lib/api/weatherClient'

export function useWeatherHistory(city: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ['weather', 'history', city, from, to],
    queryFn: () => weatherApi.getHistory(city, from, to),
    enabled: !!city,
    staleTime: 10 * 60 * 1000,
  })
}
