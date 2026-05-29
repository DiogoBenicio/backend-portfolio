'use client'

import { Monitor, Shield, Lock, Cloud, Star, Database } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { ServiceHealthResult, ServiceStatus } from '@/hooks/useServiceHealth'

// ─── Coordinate system: 680 × 460 ───────────────────────────────────────────
const VB_W = 680
const VB_H = 460
const BH = 58 // box height (all nodes)

const CX: Record<string, number> = {
  browser: 340,
  nginx: 340,
  frontend: 145,
  gateway: 490,
  weather: 390,
  nps: 575,
  elastic: 390,
  postgres: 575,
}
const CY: Record<string, number> = {
  browser: 36,
  nginx: 128,
  frontend: 225,
  gateway: 225,
  weather: 320,
  nps: 320,
  elastic: 410,
  postgres: 410,
}
const BW: Record<string, number> = {
  browser: 148,
  nginx: 165,
  frontend: 150,
  gateway: 176,
  weather: 154,
  nps: 144,
  elastic: 148,
  postgres: 140,
}

const pct = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`

function nodeStyle(key: string): React.CSSProperties {
  const w = BW[key]
  return {
    position: 'absolute',
    left: pct(CX[key] - w / 2, VB_W),
    top: pct(CY[key] - BH / 2, VB_H),
    width: pct(w, VB_W),
    height: pct(BH, VB_H),
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
    <>
      <style>{`
        @keyframes blinkPulse {
          0%, 100% { opacity: 0; }
          25%, 75% { opacity: 1; }
        }
      `}</style>
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'online' && 'bg-green-500',
          status === 'degraded' && 'bg-yellow-400',
          status === 'offline' && 'bg-red-500'
        )}
        style={
          status === 'online'
            ? { animation: 'blinkPulse 3.2s ease-in-out infinite', willChange: 'opacity' }
            : status === 'offline'
              ? { animation: 'blinkPulse 1.0s ease-in-out infinite', willChange: 'opacity' }
              : undefined
        }
      />
    </>
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
        'absolute flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-2 text-center shadow-sm',
        border,
        bg
      )}
    >
      <div className="mb-0.5 flex items-center gap-1.5">
        {icon}
        {status !== undefined && <StatusDot status={status} />}
      </div>
      <span className="text-[11px] font-semibold leading-tight text-gray-800 dark:text-slate-200">
        {label}
      </span>
      {sublabel && (
        <span className="text-[9px] leading-tight text-gray-400 dark:text-slate-500">
          {sublabel}
        </span>
      )}
    </div>
  )
}

function Connector({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  const dx = x2 - x1
  const my = (y1 + y2) / 2
  const r = 12 // corner radius

  let d: string
  if (Math.abs(dx) < 4) {
    // vertical — linha reta
    d = `M ${x1} ${y1} L ${x2} ${y2}`
  } else if (dx > 0) {
    // vai para direita
    d = `M ${x1} ${y1} L ${x1} ${my - r} Q ${x1} ${my} ${x1 + r} ${my} L ${x2 - r} ${my} Q ${x2} ${my} ${x2} ${my + r} L ${x2} ${y2}`
  } else {
    // vai para esquerda
    d = `M ${x1} ${y1} L ${x1} ${my - r} Q ${x1} ${my} ${x1 - r} ${my} L ${x2 + r} ${my} Q ${x2} ${my} ${x2} ${my + r} L ${x2} ${y2}`
  }

  return (
    <path
      d={d}
      fill="none"
      stroke="#64748b"
      strokeWidth="1.2"
      strokeDasharray="4 3"
      strokeLinecap="round"
      strokeLinejoin="round"
      markerEnd="url(#arch-arrow)"
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  statuses: ServiceHealthResult
}

const MOBILE_FLOW = [
  { label: 'Browser', sublabel: 'HTTP' },
  { label: 'Nginx', sublabel: 'Reverse Proxy · TLS', statusKey: 'nginx' as const },
  {
    split: [
      { label: 'Frontend', sublabel: 'Next.js 14', color: 'border-blue-400 dark:border-blue-600' },
      {
        label: 'Gateway-API',
        sublabel: 'Rate Limit · Proxy',
        color: 'border-slate-400 dark:border-slate-500',
        statusKey: 'gateway' as const,
      },
    ],
    nginxBranch: true,
  },
  {
    split: [
      {
        label: 'Weather-API',
        sublabel: 'Spring Boot 3',
        color: 'border-orange-400 dark:border-orange-600',
        statusKey: 'weather' as const,
      },
      {
        label: 'NPS-API',
        sublabel: 'Fastify + Prisma',
        color: 'border-blue-400 dark:border-blue-600',
        statusKey: 'nps' as const,
      },
    ],
    arrowRight: true,
  },
  {
    split: [
      {
        label: 'Elasticsearch',
        sublabel: 'design',
        color: 'border-orange-400 dark:border-orange-600',
      },
      { label: 'PostgreSQL', sublabel: 'produção', color: 'border-blue-400 dark:border-blue-600' },
    ],
    parallelArrows: true,
  },
]

function MobileArrow() {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none" className="my-0.5 shrink-0">
      <line x1="6" y1="0" x2="6" y2="14" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 2" />
      <polygon points="0,12 6,20 12,12" fill="#64748b" />
    </svg>
  )
}

// Duas setas paralelas (Weather→Elastic e NPS→Postgres)
function ParallelArrows() {
  return (
    <svg
      width="100%"
      viewBox="0 0 200 28"
      fill="none"
      preserveAspectRatio="none"
      className="my-0.5"
      style={{ height: 28 }}
    >
      <defs>
        <marker id="m-arr-p" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#64748b" />
        </marker>
      </defs>
      <line
        x1="50"
        y1="0"
        x2="50"
        y2="22"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        markerEnd="url(#m-arr-p)"
      />
      <line
        x1="150"
        y1="0"
        x2="150"
        y2="22"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        markerEnd="url(#m-arr-p)"
      />
    </svg>
  )
}

// Seta que parte do centro (Nginx) e bifurca para esquerda (Frontend) e direita (Gateway)
function NginxBranchArrow() {
  return (
    <svg
      width="100%"
      viewBox="0 0 200 48"
      fill="none"
      preserveAspectRatio="none"
      className="my-0.5"
      style={{ height: 48 }}
    >
      <defs>
        <marker id="m-arr-n" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#64748b" />
        </marker>
      </defs>
      <line
        x1="100"
        y1="0"
        x2="100"
        y2="22"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <line
        x1="50"
        y1="22"
        x2="150"
        y2="22"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      <line
        x1="50"
        y1="22"
        x2="50"
        y2="42"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        markerEnd="url(#m-arr-n)"
      />
      <line
        x1="150"
        y1="22"
        x2="150"
        y2="42"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        markerEnd="url(#m-arr-n)"
      />
    </svg>
  )
}

// Seta que parte do lado direito (Gateway) e bifurca para duas colunas
function GatewayBranchArrow() {
  // largura total = 100% do container; Gateway ocupa metade direita (~75% do centro)
  // SVG: 200 de largura, origem no centro-direito (150), bifurca para 50 e 150
  return (
    <svg
      width="100%"
      viewBox="0 0 200 48"
      fill="none"
      preserveAspectRatio="none"
      className="my-0.5"
      style={{ height: 48 }}
    >
      <defs>
        <marker id="m-arr" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#64748b" />
        </marker>
      </defs>
      {/* Linha saindo do Gateway (centro-direito) para baixo até bifurcação */}
      <line
        x1="150"
        y1="0"
        x2="150"
        y2="22"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      {/* Braço horizontal */}
      <line
        x1="50"
        y1="22"
        x2="150"
        y2="22"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
      />
      {/* Seta esquerda → Weather */}
      <line
        x1="50"
        y1="22"
        x2="50"
        y2="42"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        markerEnd="url(#m-arr)"
      />
      {/* Seta direita → NPS */}
      <line
        x1="150"
        y1="22"
        x2="150"
        y2="42"
        stroke="#64748b"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        markerEnd="url(#m-arr)"
      />
    </svg>
  )
}

function MobileFlow({ statuses }: { statuses: ServiceHealthResult }) {
  return (
    <div className="flex flex-col items-center gap-0">
      {MOBILE_FLOW.map((step, i) =>
        'split' in step ? (
          <div key={i} className="flex w-full flex-col items-center">
            {'parallelArrows' in step && step.parallelArrows ? (
              <ParallelArrows />
            ) : 'nginxBranch' in step && step.nginxBranch ? (
              <NginxBranchArrow />
            ) : 'arrowRight' in step && step.arrowRight ? (
              <GatewayBranchArrow />
            ) : (
              <MobileArrow />
            )}
            <div className="flex w-full justify-center gap-3">
              {step.split!.map((s) => {
                const status =
                  'statusKey' in s
                    ? statuses[s.statusKey as keyof ServiceHealthResult]?.status
                    : undefined
                return (
                  <div
                    key={s.label}
                    className={cn(
                      'flex flex-1 flex-col items-center rounded-lg border-2 px-2 py-2 text-center dark:bg-slate-800/60',
                      s.color
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                        {s.label}
                      </span>
                      {status && <StatusDot status={status} />}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-slate-500">
                      {s.sublabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div key={i} className="flex w-full flex-col items-center">
            {i > 0 && <MobileArrow />}
            <div className="w-full rounded-lg border-2 border-slate-400 bg-slate-100/60 px-3 py-2 text-center dark:border-slate-600 dark:bg-slate-800/60">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                  {step.label}
                </span>
                {'statusKey' in step && step.statusKey && (
                  <StatusDot
                    status={statuses[step.statusKey as keyof ServiceHealthResult]?.status}
                  />
                )}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">{step.sublabel}</span>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export function ArchitectureDiagram({ statuses }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white/70 p-6 shadow-md backdrop-blur-sm dark:border-slate-700 dark:bg-gray-800/50">
      {/* Mobile */}
      <div className="sm:hidden">
        <MobileFlow statuses={statuses} />
      </div>

      {/* Desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <div
          className="relative mx-auto w-full min-w-[580px]"
          style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
        >
          {/* SVG overlay — connections only */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <marker
                id="arch-arrow"
                markerWidth="6"
                markerHeight="5"
                refX="5"
                refY="2.5"
                orient="auto"
              >
                <polygon points="0 0, 6 2.5, 0 5" fill="#64748b" />
              </marker>
            </defs>

            {/* Browser → Nginx */}
            <Connector x1={cx('browser')} y1={btm('browser')} x2={cx('nginx')} y2={tp('nginx')} />

            {/* Nginx → Frontend */}
            <Connector x1={cx('nginx')} y1={btm('nginx')} x2={cx('frontend')} y2={tp('frontend')} />

            {/* Nginx → Gateway */}
            <Connector x1={cx('nginx')} y1={btm('nginx')} x2={cx('gateway')} y2={tp('gateway')} />

            {/* Gateway → Weather */}
            <Connector
              x1={cx('gateway')}
              y1={btm('gateway')}
              x2={cx('weather')}
              y2={tp('weather')}
            />

            {/* Gateway → NPS */}
            <Connector x1={cx('gateway')} y1={btm('gateway')} x2={cx('nps')} y2={tp('nps')} />

            {/* Weather → Elasticsearch */}
            <Connector
              x1={cx('weather')}
              y1={btm('weather')}
              x2={cx('elastic')}
              y2={tp('elastic')}
            />

            {/* NPS → PostgreSQL */}
            <Connector x1={cx('nps')} y1={btm('nps')} x2={cx('postgres')} y2={tp('postgres')} />
          </svg>

          {/* Nodes */}
          <DiagramNode
            nodeKey="browser"
            icon={<Monitor size={13} className="text-gray-500" />}
            label="Browser / Cliente"
            sublabel="HTTP"
            border="border-gray-200 dark:border-slate-600"
            bg="bg-gray-50 dark:bg-slate-800/60"
          />
          <DiagramNode
            nodeKey="nginx"
            icon={<Shield size={13} className="text-gray-600 dark:text-slate-300" />}
            label="Nginx"
            sublabel="Reverse Proxy · :80"
            border="border-gray-300 dark:border-slate-500"
            bg="bg-gray-100 dark:bg-slate-700/60"
            status={statuses.nginx.status}
          />
          <DiagramNode
            nodeKey="frontend"
            icon={<Monitor size={13} className="text-blue-500" />}
            label="Frontend"
            sublabel="Next.js 14"
            border="border-blue-200 dark:border-blue-700"
            bg="bg-blue-50 dark:bg-blue-900/30"
          />
          <DiagramNode
            nodeKey="gateway"
            icon={<Lock size={13} className="text-blue-500 dark:text-blue-400" />}
            label="Gateway-API"
            sublabel="Rate Limit · Proxy"
            border="border-blue-200 dark:border-blue-700"
            bg="bg-blue-50 dark:bg-blue-900/30"
            status={statuses.gateway.status}
          />
          <DiagramNode
            nodeKey="weather"
            icon={<Cloud size={13} className="text-orange-500" />}
            label="Weather-API"
            sublabel="Spring Boot 3"
            border="border-orange-200 dark:border-orange-700"
            bg="bg-orange-50 dark:bg-orange-900/30"
            status={statuses.weather.status}
          />
          <DiagramNode
            nodeKey="nps"
            icon={<Star size={13} className="text-blue-500" />}
            label="NPS-API"
            sublabel="Fastify 4 + Prisma"
            border="border-blue-200 dark:border-blue-700"
            bg="bg-blue-50 dark:bg-blue-900/30"
            status={statuses.nps.status}
          />
          <DiagramNode
            nodeKey="elastic"
            icon={<Database size={12} className="text-orange-400 dark:text-orange-300" />}
            label="Elasticsearch"
            border="border-orange-300 dark:border-orange-700"
            bg="bg-orange-50/60 dark:bg-orange-900/20"
          />
          <DiagramNode
            nodeKey="postgres"
            icon={<Database size={12} className="text-blue-400 dark:text-blue-300" />}
            label="PostgreSQL"
            border="border-blue-300 dark:border-blue-700"
            bg="bg-blue-50/60 dark:bg-blue-900/20"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-3 text-[10px] text-gray-400 dark:border-slate-700 dark:text-slate-500">
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
