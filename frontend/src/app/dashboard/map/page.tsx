'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/ui/loadingspinner'
import { useSidebar } from '@/components/layout/SidebarContext'

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
  const { collapsed } = useSidebar()

  return (
    <div
      className="flex h-svh flex-col px-6 py-6 md:px-10 transition-all duration-200"
      style={{ marginRight: collapsed ? '-4rem' : '-15rem' }}
    >
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Mapa de Clima</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Clique nos marcadores para ver o clima em tempo real · OpenStreetMap (gratuito)
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-slate-700">
        <WeatherMap />
      </div>
    </div>
  )
}
