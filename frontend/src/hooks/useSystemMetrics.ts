'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export interface SystemMetricsData {
  system: {
    platform: string
    arch: string
    cpuModel: string
    cpuCount: number
    loadAvg1: number
    loadAvg5: number
    loadAvg15: number
    totalMem: number
    freeMem: number
    uptime: number
  }
  process: {
    heapUsed: number
    heapTotal: number
    rss: number
    uptime: number
    nodeVersion: string
  }
  disk: {
    total: number
    free: number
    available: number
  } | null
  timestamp: number
}

export interface MetricsHistory {
  cpu: number
  mem: number
  heap: number
  time: number
}

export function useSystemMetrics() {
  const [history, setHistory] = useState<MetricsHistory[]>([])

  const query = useQuery<SystemMetricsData>({
    queryKey: ['system-metrics'],
    queryFn: () =>
      fetch('/api/metrics').then((r) => {
        if (!r.ok) throw new Error(`metrics error ${r.status}`)
        return r.json()
      }),
    refetchInterval: 5000,
    staleTime: 4000,
    throwOnError: false,
  })

  useEffect(() => {
    if (!query.data) return
    const { system, process: proc } = query.data
    const cpuPct = Math.min((system.loadAvg1 / system.cpuCount) * 100, 100)
    const memPct = ((system.totalMem - system.freeMem) / system.totalMem) * 100
    const heapPct = (proc.heapUsed / proc.heapTotal) * 100
    setHistory((prev) => [
      ...prev.slice(-19),
      { cpu: cpuPct, mem: memPct, heap: heapPct, time: query.data!.timestamp },
    ])
  }, [query.data])

  return { ...query, history }
}
