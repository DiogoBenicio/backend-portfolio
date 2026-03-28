import { useQuery } from '@tanstack/react-query'
import { weatherApi } from '@/lib/api/weatherClient'

export function useWeatherSensors(city: string, from: string, to: string) {
  return useQuery({
    queryKey: ['weather', 'sensors', city, from, to],
    queryFn: () => weatherApi.getSensors(city, from, to),
    enabled: !!city && !!from && !!to,
    staleTime: 10 * 60 * 1000, // 10 minutos — backend faz gap-fill, dados são completos
    retry: 1,
  })
}
