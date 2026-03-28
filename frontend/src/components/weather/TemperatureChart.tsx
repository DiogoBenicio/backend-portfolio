'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useTheme } from 'next-themes'
import type { ForecastDay } from '@/types/weather'
import { formatDate } from '@/lib/utils/weatherUtils'

interface TemperatureChartProps {
  forecast: ForecastDay[]
}

export function TemperatureChart({ forecast }: TemperatureChartProps) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  const data = forecast.map((d) => ({
    date: formatDate(d.date),
    Máx: Math.round(d.tempMax),
    Mín: Math.round(d.tempMin),
  }))

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#f0f0f0'} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: dark ? '#94a3b8' : '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: dark ? '#94a3b8' : '#6b7280' }} unit="°" />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: `1px solid ${dark ? '#475569' : '#e5e7eb'}`,
              background: dark ? '#0f172a' : '#fff',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 2, color: dark ? '#f1f5f9' : '#111827' }}
            itemStyle={{ color: dark ? '#cbd5e1' : '#374151' }}
            formatter={(value) => [`${value}°C`]}
          />
          <Line type="monotone" dataKey="Máx" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
          <Line
            type="monotone"
            dataKey="Mín"
            stroke="#93c5fd"
            strokeWidth={2}
            dot={{ r: 4 }}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
