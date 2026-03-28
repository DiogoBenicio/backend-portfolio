import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { weatherApi } from '@/lib/api/weatherClient'

export function useForecast(city: string, days = 5) {
  return useQuery({
    queryKey: ['weather', 'forecast', city, days],
    queryFn: () => weatherApi.getForecast(city, days),
    enabled: !!city,
    staleTime: 60 * 60 * 1000, // 1 hora
    retry: 1,
    placeholderData: keepPreviousData,
  })
}
