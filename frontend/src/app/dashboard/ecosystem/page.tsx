'use client'

import { Cloud, Lock, Monitor, Shield, Star, Layers } from 'lucide-react'
import { useServiceHealth } from '@/hooks/useServiceHealth'
import { ServiceStatusBar } from '@/components/ecosystem/ServiceStatusBar'
import { ArchitectureDiagram } from '@/components/ecosystem/ArchitectureDiagram'
import { ServiceCard } from '@/components/ecosystem/ServiceCard'
import { LiveMetrics } from '@/components/ecosystem/LiveMetrics'
import { PageContainer } from '@/components/layout/PageContainer'

const SERVICES = [
  {
    key: 'nginx',
    icon: Shield,
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
      'Centraliza autenticação JWT (HS256, 2h TTL), rate limiting (30 req/min), logging colorido e proxy reverso para os backends.',
    pattern: 'Layered SOA',
    tech: ['Node.js 20', 'TypeScript', 'Fastify 4', 'jsonwebtoken', 'axios'],
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
    borderColor: 'border-purple-300 dark:border-purple-800',
  },
] as const

export default function EcosystemPage() {
  const statuses = useServiceHealth()

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {/* Header */}
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers size={22} className="text-gray-700 dark:text-slate-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Ecossistema BackEnd</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">
            Visão geral dos serviços, arquitetura e métricas em tempo real.
          </p>
        </header>

        {/* Status bar */}
        <ServiceStatusBar statuses={statuses} />

        {/* Diagrama arquitetural */}
        <ArchitectureDiagram statuses={statuses} />

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
                status={service.key ? statuses[service.key as keyof typeof statuses] : undefined}
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
