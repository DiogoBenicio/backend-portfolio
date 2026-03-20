import { useQuery } from '@tanstack/react-query'
import { weatherApi } from '@/lib/api/weatherClient'

export function useCurrentWeather(city: string, country?: string) {
  return useQuery({
    queryKey: ['weather', 'current', city, country],
    queryFn: () => weatherApi.getCurrent(city, country),
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  })
}
