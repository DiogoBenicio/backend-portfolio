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
import type { ForecastDay } from '@/types/weather'
import { formatDate } from '@/lib/utils/weatherUtils'

interface HumidityChartProps {
  forecast: ForecastDay[]
}

export function HumidityChart({ forecast }: HumidityChartProps) {
  const data = forecast.map((d) => ({
    date: formatDate(d.date),
    Umidade: d.humidity,
  }))

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} unit="%" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            formatter={(value) => [`${value}%`, 'Umidade']}
          />
          <Bar dataKey="Umidade" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={`hsl(${210 + i * 8}, 70%, ${60 - i * 3}%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
