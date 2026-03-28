import { Droplets, Wind, Thermometer, Gauge } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { CurrentWeather } from '@/types/weather'
import { formatTemperature, formatWindSpeed, getWeatherIconUrl } from '@/lib/utils/weatherUtils'
import Image from 'next/image'

interface CurrentWeatherCardProps {
  weather: CurrentWeather
}

export function CurrentWeatherCard({ weather }: CurrentWeatherCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              {weather.city}, {weather.country}
            </h2>
            <p className="mt-1 text-sm capitalize text-gray-500 dark:text-slate-400">{weather.description}</p>
          </div>
          {weather.icon && (
            <Image
              src={getWeatherIconUrl(weather.icon)}
              alt={weather.description}
              width={64}
              height={64}
              className="shrink-0"
            />
          )}
        </div>

        <div className="mt-4 flex items-end gap-3">
          <span className="text-6xl font-light text-gray-900 dark:text-slate-100">
            {Math.round(weather.temperature)}
          </span>
          <span className="mb-2 text-3xl text-gray-400 dark:text-slate-500">°C</span>
          <span className="mb-2 text-sm text-gray-500 dark:text-slate-400">
            Sensação {formatTemperature(weather.feelsLike)}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatItem icon={<Droplets size={16} />} label="Umidade" value={`${weather.humidity}%`} />
          <StatItem
            icon={<Wind size={16} />}
            label="Vento"
            value={`${formatWindSpeed(weather.windSpeed)} ${weather.windDirection}`}
          />
          <StatItem icon={<Gauge size={16} />} label="Pressão" value={`${weather.pressure} hPa`} />
          <StatItem
            icon={<Thermometer size={16} />}
            label="Chuva"
            value={`${weather.rainfall.toFixed(1)} mm`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-slate-700/60">
      <span className="text-blue-500 dark:text-blue-400">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}
