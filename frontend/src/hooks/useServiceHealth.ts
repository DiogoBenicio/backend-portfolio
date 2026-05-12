import { useQueries } from '@tanstack/react-query'
import axios from 'axios'

export type ServiceStatus = 'checking' | 'online' | 'degraded' | 'offline'

export interface ServiceHealthEntry {
  status: ServiceStatus
  latencyMs: number | null
  checkedAt: Date | null
}

export interface ServiceHealthResult {
  nginx: ServiceHealthEntry
  gateway: ServiceHealthEntry
  weather: ServiceHealthEntry
  nps: ServiceHealthEntry
}

async function checkEndpoint(
  url: string,
  degradeOn4xx = false
): Promise<{ status: ServiceStatus; latencyMs: number }> {
  const start = Date.now()
  try {
    const response = await axios.get(url, {
      timeout: 4000,
      validateStatus: () => true,
    })
    const latencyMs = Date.now() - start
    if (response.status < 300) return { status: 'online', latencyMs }
    if (response.status < 500 && degradeOn4xx) return { status: 'degraded', latencyMs }
    if (response.status < 500) return { status: 'online', latencyMs }
    return { status: 'offline', latencyMs }
  } catch {
    return { status: 'offline', latencyMs: Date.now() - start }
  }
}

const CHECKS = [
  { key: 'nginx', url: '/nginx-health', degrade: false },
  { key: 'gateway', url: '/api/health', degrade: false },
  { key: 'weather', url: '/api/weather/health', degrade: false },
  { key: 'nps', url: '/api/nps/summary', degrade: false },
] as const

const LOADING_ENTRY: ServiceHealthEntry = { status: 'checking', latencyMs: null, checkedAt: null }
const OFFLINE_ENTRY: ServiceHealthEntry = { status: 'offline', latencyMs: null, checkedAt: null }

export function useServiceHealth(): ServiceHealthResult {
  const results = useQueries({
    queries: CHECKS.map(({ key, url, degrade }) => ({
      queryKey: ['service-health', key],
      queryFn: () => checkEndpoint(url, degrade),
      staleTime: 25_000,
      refetchInterval: 30_000,
      refetchOnWindowFocus: false,
      retry: 0,
    })),
  })

  function toEntry(i: number): ServiceHealthEntry {
    const r = results[i]
    if (r.isLoading) return LOADING_ENTRY
    if (!r.data) return OFFLINE_ENTRY
    return {
      status: r.data.status,
      latencyMs: r.data.latencyMs,
      checkedAt: r.dataUpdatedAt ? new Date(r.dataUpdatedAt) : null,
    }
  }

  return {
    nginx: toEntry(0),
    gateway: toEntry(1),
    weather: toEntry(2),
    nps: toEntry(3),
  }
}
