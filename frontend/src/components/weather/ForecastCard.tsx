import Image from 'next/image'
import type { ForecastDay } from '@/types/weather'
import { getWeatherIconUrl, formatDate } from '@/lib/utils/weatherUtils'

interface ForecastCardProps {
  forecast: ForecastDay[]
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {forecast.map((day) => (
        <div
          key={day.date}
          className="flex min-w-[100px] flex-col items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-4 text-center"
        >
          <p className="text-xs font-medium text-gray-500">{formatDate(day.date)}</p>
          {day.icon && (
            <Image
              src={getWeatherIconUrl(day.icon)}
              alt={day.description}
              width={40}
              height={40}
              className="my-1"
            />
          )}
          <p className="text-sm font-bold text-gray-900">{Math.round(day.tempMax)}°</p>
          <p className="text-xs text-gray-400">{Math.round(day.tempMin)}°</p>
          <p className="mt-1 text-xs capitalize text-gray-500 line-clamp-2">{day.description}</p>
        </div>
      ))}
    </div>
  )
}
