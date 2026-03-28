'use client'

import { cn } from '@/lib/utils/cn'
import type { ServiceHealthResult, ServiceStatus } from '@/hooks/useServiceHealth'

const SERVICES: { key: keyof ServiceHealthResult; label: string }[] = [
  { key: 'nginx', label: 'Nginx' },
  { key: 'gateway', label: 'Gateway-API' },
  { key: 'weather', label: 'Weather-API' },
  { key: 'nps', label: 'NPS-API' },
]

function StatusDot({ status }: { status: ServiceStatus }) {
  return (
    <>
      <style>{`
        @keyframes blinkPulse {
          0%, 100% { opacity: 0; }
          30%, 70% { opacity: 1; }
        }
      `}</style>
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          status === 'online' && 'bg-green-500',
          status === 'degraded' && 'bg-yellow-400',
          status === 'offline' && 'bg-red-500',
          status === 'checking' && 'bg-gray-300'
        )}
        style={
          status === 'online'
            ? {
                animation: 'blinkPulse 2.8s ease-in-out infinite',
                willChange: 'opacity',
              }
            : status === 'offline'
              ? {
                  animation: 'blinkPulse 1.0s ease-in-out infinite',
                  willChange: 'opacity',
                }
              : undefined
        }
      />
    </>
  )
}

function statusLabel(status: ServiceStatus): string {
  const map: Record<ServiceStatus, string> = {
    online: 'online',
    degraded: 'degradado',
    offline: 'offline',
    checking: 'verificando',
  }
  return map[status]
}

interface Props {
  statuses: ServiceHealthResult
}

export function ServiceStatusBar({ statuses }: Props) {
  const allOnline = SERVICES.every((s) => statuses[s.key] === 'online')

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-white/50 bg-white/70 px-5 py-4 shadow-md backdrop-blur-sm dark:border-white/10 dark:bg-gray-800/60">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            allOnline ? 'bg-green-500' : 'bg-yellow-400'
          )}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Status dos serviços
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {SERVICES.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5">
            <StatusDot status={statuses[key] ?? 'checking'} />
            <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({statusLabel(statuses[key] ?? 'checking')})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
