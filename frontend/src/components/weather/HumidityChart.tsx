'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useTheme } from 'next-themes'
import type { ForecastDay } from '@/types/weather'
import { formatDate } from '@/lib/utils/weatherUtils'

interface HumidityChartProps {
  forecast: ForecastDay[]
}

export function HumidityChart({ forecast }: HumidityChartProps) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  const data = forecast.map((d) => ({
    date: formatDate(d.date),
    Umidade: d.humidity,
  }))

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#f0f0f0'} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: dark ? '#94a3b8' : '#6b7280' }} />
          <YAxis
            tick={{ fontSize: 12, fill: dark ? '#94a3b8' : '#6b7280' }}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: dark ? 'rgba(148,163,184,0.1)' : 'rgba(0,0,0,0.05)' }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${dark ? '#475569' : '#e5e7eb'}`,
              background: dark ? '#0f172a' : '#fff',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 2, color: dark ? '#f1f5f9' : '#111827' }}
            itemStyle={{ color: dark ? '#cbd5e1' : '#374151' }}
            formatter={(value) => [`${value}%`, 'Umidade']}
          />
          <Bar dataKey="Umidade" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${210 + i * 8}, 70%, ${dark ? 55 + i * 2 : 60 - i * 3}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
