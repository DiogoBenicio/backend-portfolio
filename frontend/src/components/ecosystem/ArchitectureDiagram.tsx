'use client'

import { Monitor, Shield, Lock, Cloud, Star, Database, Layers } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ServiceHealthResult, ServiceStatus } from '@/hooks/useServiceHealth'

// ─── Coordinate system: 680 × 460 ───────────────────────────────────────────
const VB_W = 680
const VB_H = 460
const BH = 58 // box height (all nodes)

const CX: Record<string, number> = {
  browser: 340, nginx: 340, frontend: 145, gateway: 490,
  weather: 390, nps: 575, elastic: 390, postgres: 575,
}
const CY: Record<string, number> = {
  browser: 36, nginx: 128, frontend: 225, gateway: 225,
  weather: 320, nps: 320, elastic: 410, postgres: 410,
}
const BW: Record<string, number> = {
  browser: 148, nginx: 165, frontend: 150, gateway: 176,
  weather: 154, nps: 144, elastic: 148, postgres: 140,
}

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`

function nodeStyle(key: string): React.CSSProperties {
  const w = BW[key]
  return {
    position: 'absolute',
    left: pct(CX[key] - w / 2, VB_W),
    top: pct(CY[key] - BH / 2, VB_H),
    width: pct(w, VB_W),
  }
}

const btm = (k: string) => CY[k] + BH / 2
const tp = (k: string) => CY[k] - BH / 2
const cx = (k: string) => CX[k]

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusDot({ status }: { status?: ServiceStatus }) {
  if (!status || status === 'checking')
    return <span className="h-2 w-2 animate-pulse rounded-full bg-gray-300" />
  return (
    <span
      className={cn(
        'h-2 w-2 rounded-full',
        status === 'online' && 'bg-green-500',
        status === 'degraded' && 'bg-yellow-400',
        status === 'offline' && 'bg-red-500',
      )}
    />
  )
}

interface NodeProps {
  nodeKey: string
  icon: React.ReactNode
  label: string
  sublabel?: string
  border: string
  bg: string
  status?: ServiceStatus
}

function DiagramNode({ nodeKey, icon, label, sublabel, border, bg, status }: NodeProps) {
  return (
    <div
      style={nodeStyle(nodeKey)}
      className={cn(
        'absolute flex flex-col items-center gap-0.5 rounded-xl border-2 px-2 py-2 text-center shadow-sm',
        border,
        bg,
      )}
    >
      <div className="mb-0.5 flex items-center gap-1.5">
        {icon}
        {status !== undefined && <StatusDot status={status} />}
      </div>
      <span className="text-[11px] font-semibold leading-tight text-gray-800">{label}</span>
      {sublabel && <span className="text-[9px] leading-tight text-gray-400">{sublabel}</span>}
    </div>
  )
}

function Connector({
  x1, y1, x2, y2,
}: {
  x1: number; y1: number; x2: number; y2: number
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="#cbd5e1"
      strokeWidth="1.5"
      strokeDasharray="5 4"
      markerEnd="url(#arch-arrow)"
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  statuses: ServiceHealthResult
}

export function ArchitectureDiagram({ statuses }: Props) {
  return (
    <div className="rounded-xl border border-white/50 bg-white/70 p-6 shadow-md backdrop-blur-sm">
      <div className="mb-5 flex items-center gap-2">
        <Layers size={16} className="text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700">Diagrama Arquitetural</h2>
      </div>

      {/* Responsive diagram container */}
      <div className="relative mx-auto w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
        {/* SVG overlay — connections only */}
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="arch-arrow"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
            </marker>
          </defs>

          {/* Browser → Nginx */}
          <Connector x1={cx('browser')} y1={btm('browser')} x2={cx('nginx')} y2={tp('nginx') - 4} />

          {/* Nginx → Frontend */}
          <Connector x1={cx('nginx')} y1={btm('nginx')} x2={cx('frontend')} y2={tp('frontend') - 4} />

          {/* Nginx → Gateway */}
          <Connector x1={cx('nginx')} y1={btm('nginx')} x2={cx('gateway')} y2={tp('gateway') - 4} />

          {/* Gateway → Weather */}
          <Connector x1={cx('gateway')} y1={btm('gateway')} x2={cx('weather')} y2={tp('weather') - 4} />

          {/* Gateway → NPS */}
          <Connector x1={cx('gateway')} y1={btm('gateway')} x2={cx('nps')} y2={tp('nps') - 4} />

          {/* Weather → Elasticsearch */}
          <Connector x1={cx('weather')} y1={btm('weather')} x2={cx('elastic')} y2={tp('elastic') - 4} />

          {/* NPS → PostgreSQL */}
          <Connector x1={cx('nps')} y1={btm('nps')} x2={cx('postgres')} y2={tp('postgres') - 4} />
        </svg>

        {/* Nodes */}
        <DiagramNode
          nodeKey="browser"
          icon={<Monitor size={13} className="text-gray-500" />}
          label="Browser / Cliente"
          sublabel="HTTP"
          border="border-gray-200"
          bg="bg-gray-50"
        />
        <DiagramNode
          nodeKey="nginx"
          icon={<Shield size={13} className="text-gray-600" />}
          label="Nginx"
          sublabel="Reverse Proxy · :80"
          border="border-gray-300"
          bg="bg-gray-100"
          status={statuses.nginx}
        />
        <DiagramNode
          nodeKey="frontend"
          icon={<Monitor size={13} className="text-indigo-500" />}
          label="Frontend"
          sublabel="Next.js 14"
          border="border-indigo-200"
          bg="bg-indigo-50"
        />
        <DiagramNode
          nodeKey="gateway"
          icon={<Lock size={13} className="text-blue-500" />}
          label="Gateway-API"
          sublabel="JWT · Rate Limit"
          border="border-blue-200"
          bg="bg-blue-50"
          status={statuses.gateway}
        />
        <DiagramNode
          nodeKey="weather"
          icon={<Cloud size={13} className="text-orange-500" />}
          label="Weather-API"
          sublabel="Spring Boot 3"
          border="border-orange-200"
          bg="bg-orange-50"
          status={statuses.weather}
        />
        <DiagramNode
          nodeKey="nps"
          icon={<Star size={13} className="text-indigo-500" />}
          label="NPS-API"
          sublabel="Fastify 4 + Prisma"
          border="border-indigo-200"
          bg="bg-indigo-50"
          status={statuses.nps}
        />
        <DiagramNode
          nodeKey="elastic"
          icon={<Database size={12} className="text-orange-400" />}
          label="Elasticsearch"
          border="border-orange-300"
          bg="bg-orange-50/60"
        />
        <DiagramNode
          nodeKey="postgres"
          icon={<Database size={12} className="text-indigo-400" />}
          label="PostgreSQL"
          border="border-indigo-300"
          bg="bg-indigo-50/60"
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> online
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" /> degradado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> offline
        </span>
        <span className="ml-auto">verificado a cada 30s</span>
      </div>
    </div>
  )
}
