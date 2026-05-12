'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { PageLoader } from '@/components/ui/PageLoader'
import { CitySearch } from '@/components/weather/CitySearch'

// Importação dinâmica: Leaflet depende de `window` (não funciona no SSR)
const WeatherMap = dynamic(
  () => import('@/components/map/WeatherMap').then((m) => ({ default: m.WeatherMap })),
  {
    ssr: false,
    loading: () => <PageLoader label="Carregando mapa" />,
  }
)

export default function MapPage() {
  const [pendingMarker, setPendingMarker] = useState<{
    name: string
    country: string
    lat: number
    lon: number
  } | null>(null)

  return (
    <div className="flex h-svh flex-col px-6 py-6 md:px-10">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Mapa de Clima</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Clique no mapa ou busque uma cidade para adicionar marcadores · OpenStreetMap (gratuito)
        </p>
      </div>

      <div className="relative z-50 mb-3 w-full max-w-xs sm:max-w-sm">
        <CitySearch
          onSearch={() => {}}
          onSelectFull={(r) =>
            setPendingMarker({ name: r.name, country: r.country, lat: r.lat, lon: r.lon })
          }
        />
      </div>

      <div className="relative z-0 min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-slate-700">
        <WeatherMap
          pendingMarker={pendingMarker}
          onPendingMarkerConsumed={() => setPendingMarker(null)}
        />
      </div>
    </div>
  )
}
