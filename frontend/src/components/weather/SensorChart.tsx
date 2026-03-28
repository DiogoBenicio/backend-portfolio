'use client'

import { useState } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import type { SensorPoint } from '@/types/weather'
import { cn } from '@/lib/utils/cn'

interface SensorConfig {
  key: keyof SensorPoint
  label: string
  unit: string
  color: string
  yAxisId: string
}

const SENSORS: SensorConfig[] = [
  { key: 'temperature', label: 'Temperatura',    unit: '°C',    color: '#2563eb', yAxisId: 'temp' },
  { key: 'feelsLike',   label: 'Sensação',       unit: '°C',    color: '#60a5fa', yAxisId: 'temp' },
  { key: 'dewPoint',    label: 'Pt. de Orvalho', unit: '°C',    color: '#06b6d4', yAxisId: 'temp' },
  { key: 'humidity',    label: 'Umidade',        unit: '%',     color: '#22d3ee', yAxisId: 'pct'  },
  { key: 'pressure',    label: 'Pressão',        unit: ' hPa',  color: '#a78bfa', yAxisId: 'hpa'  },
  { key: 'windSpeed',   label: 'Vento',          unit: ' km/h', color: '#34d399', yAxisId: 'temp' },
  { key: 'rainfall',    label: 'Chuva',          unit: ' mm',   color: '#818cf8', yAxisId: 'pct'  },
  { key: 'radiation',   label: 'Radiação Solar', unit: ' W/m²', color: '#f59e0b', yAxisId: 'rad'  },
  { key: 'uvIndex',     label: 'UV (est.)',      unit: '',      color: '#f97316', yAxisId: 'pct'  },
]

interface Props {
  data: SensorPoint[]
  from?: string // ISO date YYYY-MM-DD
  to?: string   // ISO date YYYY-MM-DD
}

function fmtEpoch(ms: number): string {
  return new Date(ms).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export function SensorChart({ data, from, to }: Props) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  const [active, setActive] = useState<Set<keyof SensorPoint>>(
    new Set<keyof SensorPoint>(['temperature', 'humidity'])
  )

  function toggle(key: keyof SensorPoint) {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev // pelo menos um ativo
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Calcula o domínio do eixo X baseado no range selecionado (ou nos dados)
  const domainFrom = from ? new Date(`${from}T00:00:00Z`).getTime() : undefined
  const domainTo   = to   ? new Date(`${to}T23:59:59Z`).getTime()   : undefined

  const chartData = data.map((p) => ({
    _ts: new Date(p.timestamp).getTime(),
    temperature: p.temperature,
    feelsLike: p.feelsLike,
    dewPoint: p.dewPoint,
    humidity: p.humidity,
    pressure: p.pressure,
    windSpeed: p.windSpeed,
    rainfall: p.rainfall,
    uvIndex: p.uvIndex,
    radiation: p.radiation,
  }))

  const gridColor  = dark ? '#334155' : '#f0f0f0'
  const tickStyle  = { fontSize: 11, fill: dark ? '#94a3b8' : '#6b7280' }
  const tooltipStyle = {
    fontSize: 12, borderRadius: 8,
    border: `1px solid ${dark ? '#334155' : '#e5e7eb'}`,
    background: dark ? '#1e293b' : '#fff',
    color: dark ? '#e2e8f0' : '#111827',
  }

  const activeSensors = SENSORS.filter((s) => active.has(s.key))
  const needsHpa = activeSensors.some((s) => s.yAxisId === 'hpa')
  const needsRad = activeSensors.some((s) => s.yAxisId === 'rad')

  return (
    <div className="space-y-3">
      {/* Sensor toggles */}
      <div className="flex flex-wrap gap-2">
        {SENSORS.map((s) => (
          <button
            key={s.key}
            onClick={() => toggle(s.key)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              active.has(s.key)
                ? 'border-transparent text-white'
                : 'border-gray-200 bg-transparent text-gray-500 dark:border-slate-700 dark:text-slate-400',
            )}
            style={active.has(s.key) ? { backgroundColor: s.color } : undefined}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400 dark:text-slate-500">
            Sem dados para o período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="_ts"
                scale="time"
                type="number"
                domain={[domainFrom ?? 'auto', domainTo ?? 'auto']}
                tick={tickStyle}
                tickFormatter={fmtEpoch}
                interval="preserveStartEnd"
                minTickGap={60}
              />
              <YAxis yAxisId="temp" tick={tickStyle} unit="°" width={38} />
              <YAxis yAxisId="pct"  tick={tickStyle} unit=""  width={30} orientation="right" />
              {needsHpa && (
                <YAxis yAxisId="hpa" tick={tickStyle} unit=""  width={42} orientation="right" />
              )}
              {needsRad && (
                <YAxis yAxisId="rad" tick={tickStyle} unit=""  width={48} orientation="right" />
              )}
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                labelFormatter={(label: number) => fmtEpoch(label)}
                formatter={(value: number, name: string) => {
                  const s = SENSORS.find((x) => x.label === name)
                  return [`${value}${s?.unit ?? ''}`, name]
                }}
              />
              {SENSORS.filter((s) => active.has(s.key)).map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  yAxisId={s.yAxisId}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
