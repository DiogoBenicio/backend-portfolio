'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loadingspinner'

// Importação dinâmica: Leaflet depende de `window` (não funciona no SSR)
const WeatherMap = dynamic(
  () => import('@/components/map/WeatherMap').then((m) => ({ default: m.WeatherMap })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
        <LoadingSpinner label="Carregando mapa..." />
      </div>
    ),
  }
)

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mapa de Clima</h1>
        <p className="mt-1 text-sm text-gray-500">
          Clique nos marcadores para ver o clima em tempo real · OpenStreetMap (gratuito)
        </p>
      </div>

      <div className="h-[600px] w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <WeatherMap />
      </div>

      <p className="text-xs text-gray-400 text-center">
        Dados fornecidos por OpenWeather API via Weather API backend · Mapas por OpenStreetMap
      </p>
    </div>
  )
}
