import { useQuery } from '@tanstack/react-query'

export interface InmetAlert {
  id: string
  event: string
  severity: 'perigo' | 'perigo_potencial' | 'atencao'
  start: string
  end: string
  description: string
  areas: string[]
}

export function useInmetAlerts() {
  return useQuery<InmetAlert[]>({
    queryKey: ['inmet-alerts'],
    queryFn: () => fetch('/inmet-alerts').then((r) => r.json()),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  })
}
