import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { weatherApi } from '@/lib/api/weatherClient'

export function useForecast(city: string, country?: string, days = 5) {
  return useQuery({
    queryKey: ['weather', 'forecast', city, country, days],
    queryFn: () => weatherApi.getForecast(city, days, country),
    enabled: !!city,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    placeholderData: keepPreviousData,
  })
}
