'use client'

import { Monitor, Shield, Lock, Cloud, Star, Database, Layers } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ServiceHealthResult, ServiceStatus } from '@/hooks/useServiceHealth'

interface StatusDotProps {
  status?: ServiceStatus
}

function StatusDot({ status }: StatusDotProps) {
  if (!status || status === 'checking') {
    return <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300" />
  }
  return (
    <span
      className={cn(
        'h-1.5 w-1.5 rounded-full',
        status === 'online' && 'bg-green-500',
        status === 'degraded' && 'bg-yellow-400',
        status === 'offline' && 'bg-red-500'
      )}
    />
  )
}

interface BoxProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  borderColor: string
  bgColor: string
  status?: ServiceStatus
}

function ServiceBox({ icon, label, sublabel, borderColor, bgColor, status }: BoxProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl border-2 px-4 py-3 text-center',
        borderColor,
        bgColor
      )}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        {status !== undefined && <StatusDot status={status} />}
      </div>
      <span className="text-xs font-semibold text-gray-800">{label}</span>
      {sublabel && <span className="text-[10px] text-gray-400">{sublabel}</span>}
    </div>
  )
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-5 w-px border-l-2 border-dashed border-gray-300" />
      {label && <span className="text-[9px] text-gray-400">{label}</span>}
    </div>
  )
}

interface Props {
  statuses: ServiceHealthResult
}

export function ArchitectureDiagram({ statuses }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Layers size={16} className="text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700">Diagrama Arquitetural</h2>
      </div>

      <div className="flex flex-col items-center gap-0">
        {/* Nível 0 — Browser */}
        <ServiceBox
          icon={<Monitor size={14} className="text-gray-500" />}
          label="Browser / Cliente"
          sublabel="HTTP"
          borderColor="border-gray-200"
          bgColor="bg-gray-50"
        />

        <Arrow label="porta 80" />

        {/* Nível 1 — Nginx */}
        <ServiceBox
          icon={<Shield size={14} className="text-gray-600" />}
          label="Nginx :80"
          sublabel="Reverse Proxy · único ponto externo"
          borderColor="border-gray-300"
          bgColor="bg-gray-50"
          status={statuses.nginx}
        />

        {/* Bifurcação Nginx */}
        <div className="flex w-full max-w-xl items-start justify-center gap-0">
          {/* Ramo Frontend */}
          <div className="flex flex-1 flex-col items-center">
            <div className="flex w-full justify-center">
              <div className="h-5 w-px border-l-2 border-dashed border-gray-300" />
            </div>
            <div className="flex items-center gap-0">
              <div className="h-px w-16 border-t-2 border-dashed border-gray-300" />
              <div className="h-5 w-px border-l-2 border-dashed border-gray-300" />
            </div>
            <ServiceBox
              icon={<Monitor size={14} className="text-purple-500" />}
              label="Frontend"
              sublabel="Next.js 14 · :3000"
              borderColor="border-purple-200"
              bgColor="bg-purple-50"
            />
          </div>

          {/* Ramo Gateway */}
          <div className="flex flex-1 flex-col items-center">
            <div className="flex w-full justify-center">
              <div className="h-5 w-px border-l-2 border-dashed border-gray-300" />
            </div>
            <div className="flex items-center gap-0">
              <div className="h-px w-16 border-t-2 border-dashed border-gray-300" />
              <div className="h-5 w-px border-l-2 border-dashed border-gray-300" />
            </div>
            <ServiceBox
              icon={<Lock size={14} className="text-blue-500" />}
              label="Gateway-API"
              sublabel="JWT · Rate Limit · Proxy · :4000"
              borderColor="border-blue-200"
              bgColor="bg-blue-50"
              status={statuses.gateway}
            />

            {/* Bifurcação Gateway */}
            <div className="flex w-full max-w-lg items-start justify-center gap-0">
              {/* Ramo Weather */}
              <div className="flex flex-1 flex-col items-center">
                <div className="flex items-center gap-0">
                  <div className="h-px w-10 border-t-2 border-dashed border-gray-300" />
                  <div className="h-5 w-px border-l-2 border-dashed border-gray-300" />
                </div>
                <ServiceBox
                  icon={<Cloud size={14} className="text-orange-500" />}
                  label="Weather-API"
                  sublabel="Spring Boot 3 · :8080"
                  borderColor="border-orange-200"
                  bgColor="bg-orange-50"
                  status={statuses.weather}
                />
                <Arrow />
                <ServiceBox
                  icon={<Database size={12} className="text-orange-400" />}
                  label="Elasticsearch"
                  sublabel=":9200"
                  borderColor="border-orange-100"
                  bgColor="bg-orange-50/50"
                />
              </div>

              {/* Ramo NPS */}
              <div className="flex flex-1 flex-col items-center">
                <div className="flex items-center gap-0">
                  <div className="h-px w-10 border-t-2 border-dashed border-gray-300" />
                  <div className="h-5 w-px border-l-2 border-dashed border-gray-300" />
                </div>
                <ServiceBox
                  icon={<Star size={14} className="text-green-500" />}
                  label="NPS-API"
                  sublabel="Fastify 4 + Prisma · :3001"
                  borderColor="border-green-200"
                  bgColor="bg-green-50"
                  status={statuses.nps}
                />
                <Arrow />
                <ServiceBox
                  icon={<Database size={12} className="text-green-400" />}
                  label="PostgreSQL"
                  sublabel=":5432"
                  borderColor="border-green-100"
                  bgColor="bg-green-50/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> online
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> degradado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> offline
        </span>
        <span className="ml-auto">Setas = fluxo de requisição · verificado a cada 30s</span>
      </div>
    </div>
  )
}
