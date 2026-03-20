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
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mapa de Clima</h1>
        <p className="mt-1 text-sm text-gray-500">
          Clique nos marcadores para ver o clima em tempo real · OpenStreetMap (gratuito)
        </p>
      </div>

      <div
        className="w-full overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        style={{ height: 'calc(100svh - 11rem)' }}
      >
        <WeatherMap />
      </div>
    </div>
  )
}
