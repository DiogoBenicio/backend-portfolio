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
import type { ForecastDay } from '@/types/weather'
import { formatDate } from '@/lib/utils/weatherUtils'

interface TemperatureChartProps {
  forecast: ForecastDay[]
}

export function TemperatureChart({ forecast }: TemperatureChartProps) {
  const data = forecast.map((d) => ({
    date: formatDate(d.date),
    Máx: Math.round(d.tempMax),
    Mín: Math.round(d.tempMin),
  }))

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} unit="°" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
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
