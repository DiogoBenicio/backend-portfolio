'use client'

import { Cloud, Lock, Monitor, Activity, Star, Layers } from 'lucide-react'
import { useServiceHealth } from '@/hooks/useServiceHealth'
import { ArchitectureDiagram } from '@/components/ecosystem/ArchitectureDiagram'
import { ServiceCard } from '@/components/ecosystem/ServiceCard'
import { LiveMetrics } from '@/components/ecosystem/LiveMetrics'
import { SystemMetrics } from '@/components/ecosystem/SystemMetrics'
import { PageContainer } from '@/components/layout/PageContainer'
import type {
  ServiceHealthEntry,
  ServiceHealthResult,
  ServiceStatus,
} from '@/hooks/useServiceHealth'

const SERVICES = [
  {
    key: 'nginx',
    icon: Layers,
    name: 'Nginx',
    description:
      'Único ponto de entrada externo. Termina o TCP, aplica headers de segurança e distribui o tráfego para frontend ou gateway.',
    pattern: 'Reverse Proxy',
    tech: ['Nginx 1.27', 'Alpine Linux'],
    borderColor: 'border-gray-300 dark:border-slate-600',
  },
  {
    key: 'gateway',
    icon: Lock,
    name: 'Gateway-API',
    description:
      'Proxy reverso e único ponto de entrada para os backends. Rate limiting por IP, CORS, logging estruturado e arquitetura preparada para JWT, API Key ou OAuth2 sem mudanças estruturais.',
    pattern: 'Layered SOA',
    tech: ['Node.js 20', 'TypeScript', 'Fastify 4', 'axios'],
    borderColor: 'border-blue-300 dark:border-blue-800',
    docsUrl: '/api/health',
  },
  {
    key: 'weather',
    icon: Cloud,
    name: 'Weather-API',
    description:
      'Consulta clima atual e previsão via OpenWeather API. Histórico de consultas persistido no Elasticsearch com queries por período e cidade.',
    pattern: 'Hexagonal',
    tech: ['Java 21', 'Spring Boot 3.3', 'WebClient', 'Elasticsearch 8', 'Docker'],
    borderColor: 'border-orange-300 dark:border-orange-800',
    docsUrl: '/api/weather/swagger-ui.html',
  },
  {
    key: 'nps',
    icon: Star,
    name: 'NPS-API',
    description:
      'Coleta avaliações Net Promoter Score, calcula score e zone (Crítico / Aperfeiçoamento / Qualidade / Excelência). Dados persistidos no PostgreSQL via Prisma.',
    pattern: 'Hexagonal',
    tech: ['Node.js 20', 'TypeScript', 'Fastify 4', 'Prisma 5', 'PostgreSQL 15'],
    borderColor: 'border-green-300 dark:border-green-800',
    docsUrl: '/api/nps/documentation',
  },
  {
    key: undefined,
    icon: Monitor,
    name: 'Frontend',
    description:
      'Dashboard interativo com mapa de clima em tempo real (Leaflet + OpenStreetMap), gráficos (Recharts) e formulário NPS. Esta página que você está lendo.',
    pattern: 'SSR / React',
    tech: ['Next.js 14', 'shadcn/ui', 'Tailwind CSS', 'Recharts', 'Leaflet', 'TanStack Query'],
    borderColor: 'border-blue-300 dark:border-blue-800',
  },
] as const

const OBS_SERVICES: Array<{
  key: keyof ReturnType<typeof useServiceHealth>
  label: string
  endpoint: string
}> = [
  { key: 'nginx', label: 'Nginx', endpoint: '/nginx-health' },
  { key: 'gateway', label: 'Gateway-API', endpoint: '/api/health' },
  { key: 'weather', label: 'Weather-API', endpoint: '/api/weather/health' },
  { key: 'nps', label: 'NPS-API', endpoint: '/api/nps/summary' },
]

function statusColor(status: ServiceStatus) {
  if (status === 'online') return 'text-green-500'
  if (status === 'degraded') return 'text-yellow-500'
  if (status === 'offline') return 'text-red-500'
  return 'text-gray-400'
}

function latencyColor(ms: number) {
  if (ms < 200) return 'bg-green-500'
  if (ms < 600) return 'bg-yellow-400'
  return 'bg-red-500'
}

function latencyLabel(ms: number) {
  if (ms < 200) return 'text-green-500'
  if (ms < 600) return 'text-yellow-400'
  return 'text-red-500'
}

function ObservabilityMetrics({ statuses }: { statuses: ServiceHealthResult }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {OBS_SERVICES.map(({ key, label, endpoint }) => {
        const entry: ServiceHealthEntry = statuses[key as keyof ServiceHealthResult]
        const ms = entry?.latencyMs
        const checkedAt = entry?.checkedAt
        const status = entry?.status ?? 'checking'
        const barWidth = ms != null ? Math.min((ms / 1500) * 100, 100) : 0

        return (
          <div
            key={key}
            className="rounded-xl border border-gray-200 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                {label}
              </span>
              <span className={`text-xs font-medium capitalize ${statusColor(status)}`}>
                {status === 'checking' ? 'verificando...' : status}
              </span>
            </div>

            <p className="mb-1 text-[10px] text-gray-400 dark:text-slate-500">{endpoint}</p>

            {/* Barra de latência */}
            <div className="mb-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-500 ${ms != null ? latencyColor(ms) : 'bg-gray-300'}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <div className="flex items-end justify-between">
              {ms != null ? (
                <span className={`text-lg font-bold tabular-nums ${latencyLabel(ms)}`}>
                  {ms}
                  <span className="ml-0.5 text-xs font-normal text-gray-400">ms</span>
                </span>
              ) : (
                <span className="text-sm text-gray-400 dark:text-slate-500">-</span>
              )}
              {checkedAt && (
                <span className="text-[10px] text-gray-400 dark:text-slate-500">
                  {checkedAt.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function EcosystemPage() {
  const statuses = useServiceHealth()

  return (
    <PageContainer>
      <div className="space-y-8">
        {/* Header */}
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity size={22} className="text-gray-700 dark:text-slate-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Observabilidade
            </h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">
            Visão geral dos serviços, arquitetura e métricas em tempo real.
          </p>
        </header>

        {/* Infraestrutura do host */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Infraestrutura
          </h2>
          <SystemMetrics />
        </section>

        {/* Métricas de observabilidade */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Latência por serviço
          </h2>
          <ObservabilityMetrics statuses={statuses} />
        </section>

        {/* Diagrama arquitetural */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Arquitetura
          </h2>
          <ArchitectureDiagram statuses={statuses} />
        </section>

        {/* Cards dos serviços */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Serviços
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCard
                key={service.name}
                icon={service.icon}
                name={service.name}
                description={service.description}
                pattern={service.pattern}
                tech={[...service.tech]}
                borderColor={service.borderColor}
                status={
                  service.key ? statuses[service.key as keyof typeof statuses].status : undefined
                }
                docsUrl={'docsUrl' in service ? service.docsUrl : undefined}
              />
            ))}
          </div>
        </section>

        {/* Métricas live */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Métricas em tempo real
          </h2>
          <LiveMetrics />
        </section>
      </div>
    </PageContainer>
  )
}
