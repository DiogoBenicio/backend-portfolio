'use client'

import type { LucideIcon } from 'lucide-react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import type { ServiceStatus } from '@/hooks/useServiceHealth'

const PATTERN_COLORS: Record<string, string> = {
  Hexagonal: 'bg-orange-100 text-orange-700',
  'Layered SOA': 'bg-blue-100 text-blue-700',
  'Reverse Proxy': 'bg-gray-100 text-gray-700',
  'SSR / React': 'bg-indigo-100 text-indigo-700',
}

interface Props {
  icon: LucideIcon
  name: string
  description: string
  pattern: string
  tech: string[]
  borderColor: string
  status?: ServiceStatus
  docsUrl?: string
}

export function ServiceCard({
  icon: Icon,
  name,
  description,
  pattern,
  tech,
  borderColor,
  status,
  docsUrl,
}: Props) {
  return (
    <div
      className={cn('flex flex-col gap-3 rounded-xl border-2 bg-white/70 p-5 shadow-md backdrop-blur-sm', borderColor)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} className="shrink-0 text-gray-600" />
          <span className="font-semibold text-gray-900">{name}</span>
          {status && (
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'online' && 'bg-green-500',
                status === 'degraded' && 'bg-yellow-400',
                status === 'offline' && 'bg-red-500',
                status === 'checking' && 'animate-pulse bg-gray-300'
              )}
            />
          )}
        </div>
        {docsUrl && (
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600"
          >
            <ExternalLink size={12} />
            docs
          </a>
        )}
      </div>

      {/* Padrão arquitetural */}
      <span
        className={cn(
          'w-fit rounded-full px-2.5 py-0.5 text-xs font-medium',
          PATTERN_COLORS[pattern] ?? 'bg-gray-100 text-gray-600'
        )}
      >
        {pattern}
      </span>

      {/* Descrição */}
      <p className="text-sm text-gray-500">{description}</p>

      {/* Tech badges */}
      <div className="flex flex-wrap gap-1.5">
        {tech.map((t) => (
          <Badge key={t} variant="secondary" className="text-xs">
            {t}
          </Badge>
        ))}
      </div>
    </div>
  )
}
