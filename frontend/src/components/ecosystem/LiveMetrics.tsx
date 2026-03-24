'use client'

import Image from 'next/image'
import { Cloud, Star, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { useNpsSummary } from '@/hooks/useNpsSummary'
import { getNpsZoneColor, getNpsZoneBg } from '@/lib/utils/npsUtils'
import { LoadingSpinner } from '@/components/ui/loadingspinner'

function SectionTitle({ icon: Icon, label }: { icon: typeof Cloud; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-gray-500" />
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
        <RefreshCw size={10} />
        ao vivo
      </span>
    </div>
  )
}

function WeatherWidget() {
  const { data, isLoading } = useCurrentWeather('São Paulo')

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner size={24} label="Carregando clima..." />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        Weather-API indisponível
      </div>
    )
  }

  return (
    <div className="mt-3 flex items-center gap-4">
      <Image
        src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
        alt={data.description}
        width={56}
        height={56}
        className="shrink-0"
      />
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{Math.round(data.temperature)}</span>
          <span className="text-lg text-gray-500">°C</span>
        </div>
        <p className="text-sm capitalize text-gray-500">{data.description}</p>
        <p className="text-xs text-gray-400">
          {data.city}, {data.country} · Umidade {data.humidity}%
        </p>
      </div>
    </div>
  )
}

function NpsWidget() {
  const { data, isLoading } = useNpsSummary()

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <LoadingSpinner size={24} label="Carregando NPS..." />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-400">
        NPS-API indisponível
      </div>
    )
  }

  const total = data.totalResponses
  const promoterPct = total > 0 ? Math.round((data.promoters / total) * 100) : 0
  const passivePct = total > 0 ? Math.round((data.passives / total) * 100) : 0
  const detractorPct = total > 0 ? Math.round((data.detractors / total) * 100) : 0

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-end gap-3">
        <span className={cn('text-4xl font-bold', getNpsZoneColor(data.zone))}>
          {data.npsScore.toFixed(1)}
        </span>
        <span
          className={cn(
            'mb-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
            getNpsZoneBg(data.zone)
          )}
        >
          {data.zone}
        </span>
      </div>

      <p className="text-xs text-gray-400">{total} avaliações coletadas</p>

      {/* Barra de composição */}
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div className="bg-green-400" style={{ width: `${promoterPct}%` }} />
        <div className="bg-yellow-300" style={{ width: `${passivePct}%` }} />
        <div className="bg-red-400" style={{ width: `${detractorPct}%` }} />
      </div>

      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          Promotores {promoterPct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-yellow-300" />
          Passivos {passivePct}%
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Detratores {detractorPct}%
        </span>
      </div>
    </div>
  )
}

export function LiveMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Weather live */}
      <div className="rounded-xl border border-orange-200/60 bg-white/70 p-5 shadow-md backdrop-blur-sm">
        <SectionTitle icon={Cloud} label="Clima em São Paulo" />
        <WeatherWidget />
        <p className="mt-3 text-[10px] text-gray-400">
          via Weather-API → Nginx → Gateway → OpenWeather
        </p>
      </div>

      {/* NPS live */}
      <div className="rounded-xl border border-indigo-200/60 bg-white/70 p-5 shadow-md backdrop-blur-sm">
        <SectionTitle icon={Star} label="NPS Global do Portfólio" />
        <NpsWidget />
        <p className="mt-3 text-[10px] text-gray-400">via NPS-API → Nginx → Gateway → PostgreSQL</p>
      </div>
    </div>
  )
}
