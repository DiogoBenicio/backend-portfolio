import { useQuery } from '@tanstack/react-query'
import { weatherApi } from '@/lib/api/weatherClient'

export function useWeatherCalendar(city: string, year: number, month: number) {
  return useQuery({
    queryKey: ['weather', 'calendar', city, year, month],
    queryFn: () => weatherApi.getCalendar(city, year, month),
    enabled: !!city && !!year && !!month,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  })
}
