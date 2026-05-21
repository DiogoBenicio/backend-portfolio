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
  const [clearTrigger, setClearTrigger] = useState(0)
  const [markerCount, setMarkerCount] = useState(0)
  const [pendingMarker, setPendingMarker] = useState<{
    name: string
    country: string
    lat: number
    lon: number
  } | null>(null)

  return (
    <div className="mx-auto flex h-svh w-full max-w-5xl flex-col px-6 py-8 md:px-10 xl:max-w-7xl">
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
          onMarkersChange={setMarkerCount}
          clearTrigger={clearTrigger}
        />
        {markerCount > 0 && (
          <button
            onClick={() => setClearTrigger((t) => t + 1)}
            className="absolute bottom-2 left-2 z-[1000] flex items-center gap-1.5 rounded-md border border-red-200 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm backdrop-blur-sm hover:bg-red-50 dark:border-red-800/50 dark:bg-slate-900/90 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Limpar {markerCount} marcador{markerCount !== 1 ? 'es' : ''}
          </button>
        )}
      </div>
    </div>
  )
}
