'use client'

import { Cpu, MemoryStick, HardDrive, Box } from 'lucide-react'
import { useSystemMetrics } from '@/hooks/useSystemMetrics'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function cpuColor(pct: number): string {
  if (pct < 50) return 'text-green-500'
  if (pct < 80) return 'text-yellow-500'
  return 'text-red-500'
}

function memColor(pct: number): string {
  if (pct < 70) return 'text-green-500'
  if (pct < 85) return 'text-yellow-500'
  return 'text-red-500'
}

function cpuBg(pct: number): string {
  if (pct < 50) return 'bg-green-500'
  if (pct < 80) return 'bg-yellow-400'
  return 'bg-red-500'
}

function memBg(pct: number): string {
  if (pct < 70) return 'bg-blue-500'
  if (pct < 85) return 'bg-yellow-400'
  return 'bg-red-500'
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div className="h-8 w-full" />
  const h = 32
  const w = 120
  const max = Math.max(...data, 1)
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h * 0.9 - h * 0.05}`)
    .join(' ')
  const fillPts = `0,${h} ${pts} ${w},${h}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <polygon points={fillPts} fill={color} fillOpacity="0.12" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Status dot ──────────────────────────────────────────────────────────────

function StatusDot({ pct, thresholds }: { pct: number; thresholds: [number, number] }) {
  const [warn, crit] = thresholds
  const color = pct >= crit ? 'bg-red-500' : pct >= warn ? 'bg-yellow-400' : 'bg-green-500'
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ pct, colorClass }: { pct: number; colorClass: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-700" />
      ))}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function SystemMetrics() {
  const { data, isLoading, isError, history } = useSystemMetrics()

  if (isLoading && !data) return <SkeletonCards />

  if (isError || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {['CPU', 'RAM', 'Disco', 'Node.js'].map((label) => (
          <div
            key={label}
            className="flex h-40 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white/60 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/60"
          >
            <span className="text-sm font-medium text-gray-400 dark:text-slate-500">{label}</span>
            <span className="mt-1 text-xs text-gray-300 dark:text-slate-600">Indisponível</span>
          </div>
        ))}
      </div>
    )
  }

  const { system, process: proc, disk } = data

  const cpuPct = Math.min((system.loadAvg1 / system.cpuCount) * 100, 100)
  const memUsed = system.totalMem - system.freeMem
  const memPct = (memUsed / system.totalMem) * 100
  const heapPct = (proc.heapUsed / proc.heapTotal) * 100
  const diskUsed = disk ? disk.total - disk.available : 0
  const diskPct = disk ? (diskUsed / disk.total) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1 — CPU */}
      <div className="rounded-xl border border-blue-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-blue-800/40 dark:bg-slate-800/60">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            CPU · Load Average
          </span>
          <div className="flex items-center gap-1.5">
            <StatusDot pct={cpuPct} thresholds={[50, 80]} />
            <Cpu size={14} className="text-blue-400" />
          </div>
        </div>

        <div className={`mb-1 text-2xl font-bold tabular-nums ${cpuColor(cpuPct)}`}>
          {system.loadAvg1.toFixed(2)}
        </div>

        <ProgressBar pct={cpuPct} colorClass={cpuBg(cpuPct)} />

        <div className="my-2">
          <Sparkline data={history.map((h) => h.cpu)} color="#3b82f6" />
        </div>

        <p className="text-[10px] text-gray-400 dark:text-slate-500">
          5m: {system.loadAvg5.toFixed(2)} · 15m: {system.loadAvg15.toFixed(2)} · {system.cpuCount}{' '}
          cores
        </p>
      </div>

      {/* Card 2 — RAM */}
      <div className="rounded-xl border border-blue-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-blue-800/40 dark:bg-slate-800/60">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            RAM · Memória do Sistema
          </span>
          <div className="flex items-center gap-1.5">
            <StatusDot pct={memPct} thresholds={[70, 85]} />
            <MemoryStick size={14} className="text-blue-400" />
          </div>
        </div>

        <div className={`mb-1 text-2xl font-bold tabular-nums ${memColor(memPct)}`}>
          {formatBytes(memUsed)}
        </div>

        <ProgressBar pct={memPct} colorClass={memBg(memPct)} />

        <div className="my-2">
          <Sparkline data={history.map((h) => h.mem)} color="#3b82f6" />
        </div>

        <p className="text-[10px] text-gray-400 dark:text-slate-500">
          de {formatBytes(system.totalMem)} total · {formatBytes(system.freeMem)} livre
        </p>
      </div>

      {/* Card 3 — Disco */}
      <div className="rounded-xl border border-orange-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-orange-800/40 dark:bg-slate-800/60">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Disco · Armazenamento
          </span>
          <div className="flex items-center gap-1.5">
            {disk && <StatusDot pct={diskPct} thresholds={[70, 85]} />}
            <HardDrive size={14} className="text-orange-400" />
          </div>
        </div>

        {disk ? (
          <>
            <div className="mb-1 text-2xl font-bold tabular-nums text-orange-500">
              {formatBytes(diskUsed)}
            </div>

            <ProgressBar
              pct={diskPct}
              colorClass={
                diskPct < 70 ? 'bg-orange-500' : diskPct < 85 ? 'bg-yellow-400' : 'bg-red-500'
              }
            />

            <div className="my-2 h-8 w-full" />

            <p className="text-[10px] text-gray-400 dark:text-slate-500">
              de {formatBytes(disk.total)} total · {formatBytes(disk.available)} disponível
            </p>
          </>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <span className="text-sm text-gray-300 dark:text-slate-600">não disponível</span>
          </div>
        )}
      </div>

      {/* Card 4 — Node.js Process */}
      <div className="rounded-xl border border-orange-200/60 bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:border-orange-800/40 dark:bg-slate-800/60">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Node.js · Processo
          </span>
          <div className="flex items-center gap-1.5">
            <StatusDot pct={heapPct} thresholds={[70, 85]} />
            <Box size={14} className="text-orange-400" />
          </div>
        </div>

        <div className="mb-1 text-2xl font-bold tabular-nums text-orange-500">
          {formatBytes(proc.rss, 0)}
        </div>

        <ProgressBar
          pct={heapPct}
          colorClass={
            heapPct < 70 ? 'bg-orange-500' : heapPct < 85 ? 'bg-yellow-400' : 'bg-red-500'
          }
        />

        <div className="my-2">
          <Sparkline data={history.map((h) => h.heap)} color="#f97316" />
        </div>

        <p className="text-[10px] text-gray-400 dark:text-slate-500">
          Heap: {formatBytes(proc.heapUsed, 0)} / {formatBytes(proc.heapTotal, 0)} ·{' '}
          {proc.nodeVersion}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-slate-500">
          Uptime: {formatUptime(proc.uptime)}
        </p>
      </div>
    </div>
  )
}
