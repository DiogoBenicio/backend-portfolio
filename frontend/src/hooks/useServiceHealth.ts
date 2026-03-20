import { useQueries } from '@tanstack/react-query'
import axios from 'axios'

export type ServiceStatus = 'checking' | 'online' | 'degraded' | 'offline'

export interface ServiceHealthResult {
  nginx: ServiceStatus
  gateway: ServiceStatus
  weather: ServiceStatus
  nps: ServiceStatus
}

async function checkEndpoint(url: string, degradeOn4xx = false): Promise<ServiceStatus> {
  try {
    const response = await axios.get(url, {
      timeout: 4000,
      validateStatus: () => true, // nunca lança para status HTTP
    })
    if (response.status < 300) return 'online'
    if (response.status < 500 && degradeOn4xx) return 'degraded'
    if (response.status < 500) return 'online' // 4xx = serviço respondeu
    return 'offline'
  } catch {
    return 'offline'
  }
}

const CHECKS = [
  { key: 'nginx', url: '/nginx-health', degrade: false },
  { key: 'gateway', url: '/api/health', degrade: false },
  { key: 'weather', url: '/api/weather/current?city=S%C3%A3o%20Paulo', degrade: true },
  { key: 'nps', url: '/api/nps/summary', degrade: false },
] as const

export function useServiceHealth(): ServiceHealthResult {
  const results = useQueries({
    queries: CHECKS.map(({ key, url, degrade }) => ({
      queryKey: ['service-health', key],
      queryFn: () => checkEndpoint(url, degrade),
      staleTime: 0,
      refetchInterval: 30_000,
      retry: 0,
    })),
  })

  return {
    nginx: (results[0].isLoading ? 'checking' : results[0].data) ?? 'offline',
    gateway: (results[1].isLoading ? 'checking' : results[1].data) ?? 'offline',
    weather: (results[2].isLoading ? 'checking' : results[2].data) ?? 'offline',
    nps: (results[3].isLoading ? 'checking' : results[3].data) ?? 'offline',
  }
}
