'use client'

import { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  GeoJSON,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from 'next-themes'
import { useWeatherByCoords } from '@/hooks/useWeatherByCoords'
import { useWindField } from '@/hooks/useWindField'
import { useInmetAlerts, type InmetAlert } from '@/hooks/useInmetAlerts'
import { useIbgeStates } from '@/hooks/useIbgeStates'
import { formatTemperature, formatWindSpeed } from '@/lib/utils/weatherUtils'
import { cn } from '@/lib/utils/cn'

// Fix ícones padrão do Leaflet no Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Pré-carrega leaflet-velocity uma vez no cliente
const velocityReady =
  typeof window !== 'undefined'
    ? import('leaflet-velocity').catch(() => null)
    : Promise.resolve(null)

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface MapMarker {
  id: string
  lat: number
  lon: number
  label: string
  city?: string
  country?: string
}

interface WeatherMapProps {
  initialLat?: number
  initialLon?: number
  initialZoom?: number
  pendingMarker?: { name: string; country: string; lat: number; lon: number } | null
  onPendingMarkerConsumed?: () => void
  onMarkersChange?: (count: number) => void
  clearTrigger?: number
}

// ── Configuração das camadas ──────────────────────────────────────────────────

const PANE_BACKGROUNDS: Record<string, string> = {
  precipPane: '#050e24',
}

const TILE_FILTER_CLASS: Partial<Record<string, string>> = {
  precipitation_new: 'wm-rain-tile',
  temp_new: 'wm-temp-tile',
}

const LAYER_CONFIGS = {
  precipitation_new: {
    label: 'Chuva',
    emoji: '🌧',
    activeClass: 'bg-blue-600 text-white',
    paneName: 'precipPane',
    renderType: 'tile' as const,
    tileOpacity: 1,
    legend: {
      colors: ['#9ecae1', '#3d9bff', '#1a5ccc', '#f5e642', '#ff5200'],
      labels: ['Leve', '', 'Mod.', '', 'Forte'],
      unit: 'mm/h',
    },
  },
  wind_new: {
    label: 'Vento',
    emoji: '💨',
    activeClass: 'bg-blue-600 text-white',
    paneName: 'windPane',
    renderType: 'tile' as const,
    tileOpacity: 0.22,
    legend: {
      colors: ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c'],
      labels: ['0', '3', '8', '15', '25+'],
      unit: 'm/s',
    },
  },
  temp_new: {
    label: 'Temperatura',
    emoji: '🌡',
    activeClass: 'bg-orange-500 text-white',
    paneName: 'tempPane',
    renderType: 'tile' as const,
    tileOpacity: 0.82,
    legend: {
      colors: ['#6b48ff', '#4096ff', '#00c2ff', '#00e676', '#ffeb3b', '#ff9800', '#f44336'],
      labels: ['-20', '0', '10', '20', '30', '40', '50+'],
      unit: '°C',
    },
  },
  pressure_new: {
    label: 'Pressão',
    emoji: '🔵',
    activeClass: 'bg-blue-600 text-white',
    paneName: 'pressPane',
    renderType: 'tile' as const,
    tileOpacity: 0.82,
    legend: {
      colors: ['#6b48ff', '#3f51b5', '#00bcd4', '#66bb6a', '#ff9800', '#f44336'],
      labels: ['960', '980', '1000', '1013', '1030', '1050+'],
      unit: 'hPa',
    },
  },
  alerts_inmet: {
    label: 'Alertas',
    emoji: '⚠',
    activeClass: 'bg-red-600 text-white',
    paneName: 'alertsPane',
    renderType: 'geojson' as const,
    tileOpacity: 0,
    legend: {
      colors: ['#eab308', '#f97316', '#ef4444'],
      labels: ['Atenção', 'Perigo P.', 'Perigo'],
      unit: 'INMET',
    },
  },
} as const

type LayerId = keyof typeof LAYER_CONFIGS

// ── Setup de panes ────────────────────────────────────────────────────────────

function CustomPanes() {
  const map = useMap()
  useEffect(() => {
    for (const [id, cfg] of Object.entries(LAYER_CONFIGS)) {
      if (!map.getPane(cfg.paneName)) {
        const pane = map.createPane(cfg.paneName)
        pane.style.zIndex = String(400 + Object.keys(LAYER_CONFIGS).indexOf(id))
        const bg = PANE_BACKGROUNDS[cfg.paneName]
        if (bg) pane.style.backgroundColor = bg
      }
    }
  }, [map])
  return null
}

// ── RainViewer — radar real ──────────────────────────────────────────────────

function RainViewerLayer({ pane }: { pane: string }) {
  const [tileUrl, setTileUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((data) => {
        const latest: string | undefined = data.radar?.past?.at(-1)?.path
        if (latest) {
          setTileUrl(`https://tilecache.rainviewer.com${latest}/512/{z}/{x}/{y}/4/1_1.png`)
        }
      })
      .catch(() => null)
  }, [])

  if (!tileUrl) return null

  return (
    <TileLayer
      url={tileUrl}
      opacity={1}
      pane={pane}
      attribution='Radar &copy; <a href="https://rainviewer.com">RainViewer</a>'
    />
  )
}

// ── Camada de partículas de vento (leaflet-velocity) ─────────────────────────

function VelocityLayer({ data, apiKey }: { data: unknown; apiKey: string }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    // Remover layer anterior imediatamente no cleanup, antes do then resolver
    if (layerRef.current) {
      try {
        map.removeLayer(layerRef.current)
      } catch {}
      layerRef.current = null
    }

    if (!data) return
    let cancelled = false

    velocityReady.then(() => {
      if (cancelled) return
      // Remover novamente — pode ter sido adicionado por ciclo anterior concorrente
      if (layerRef.current) {
        try {
          map.removeLayer(layerRef.current)
        } catch {}
        layerRef.current = null
      }
      try {
        const layer = (L as unknown as Record<string, (opts: unknown) => L.Layer>).velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: 'Vento',
            position: 'bottomleft',
            emptyString: 'Sem dados',
            angleConvention: 'bearingCCW',
            speedUnit: 'm/s',
            directionString: 'Direção',
          },
          data,
          maxVelocity: 15,
          velocityScale: 0.015,
          particleAge: 140,
          lineWidth: 3,
          particleMultiplier: 1 / 80,
          frameRate: 20,
          colorScale: ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c'],
        })
        map.addLayer(layer)
        layerRef.current = layer
      } catch {
        /* leaflet-velocity indisponível */
      }
    })

    return () => {
      cancelled = true
      if (layerRef.current) {
        try {
          map.removeLayer(layerRef.current)
        } catch {}
        layerRef.current = null
      }
    }
  }, [map, data, apiKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

// ── Invalida tamanho quando o container redimensiona ─────────────────────────

function MapAutoResize() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

// ── Zoom máximo dinâmico ─────────────────────────────────────────────────────

const RAIN_MAX_ZOOM = 6

function RainZoomGuard({ rainActive }: { rainActive: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (rainActive) {
      map.setMaxZoom(RAIN_MAX_ZOOM)
      if (map.getZoom() > RAIN_MAX_ZOOM) map.setZoom(RAIN_MAX_ZOOM)
    } else {
      map.setMaxZoom(18)
    }
  }, [map, rainActive])
  return null
}

// ── Fly para coordenadas ─────────────────────────────────────────────────────

function PanToCoords({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap()
  useEffect(() => {
    map.panTo([lat, lon], { animate: true, duration: 1 })
  }, [map, lat, lon])
  return null
}

// ── Marcador da cidade selecionada no Dashboard de Clima ─────────────────────

function SelectedCityMarker() {
  const [selected, setSelected] = useState<{
    name: string
    country?: string
    lat: number
    lng: number
  } | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('selectedMapCity')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
          setSelected(parsed)
        }
      }
    } catch {}
  }, [])

  if (!selected) return null

  const icon = L.divIcon({
    className: '',
    html: `<div style="
      width:32px;height:32px;position:relative;
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="
        position:absolute;width:32px;height:32px;border-radius:50%;
        border:3px solid #ef4444;animation:pulse-pin 1.8s ease-in-out infinite;
      "></div>
      <div style="width:10px;height:10px;border-radius:50%;background:#ef4444;"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const fakeMarker: MapMarker = {
    id: '__selected__',
    lat: selected.lat,
    lon: selected.lng,
    label: selected.name,
    city: selected.name,
    country: selected.country,
  }

  return (
    <Marker position={[selected.lat, selected.lng]} icon={icon} zIndexOffset={1000}>
      <Popup>
        <MarkerPopupContent marker={fakeMarker} onRemove={() => {}} hideRemove />
      </Popup>
    </Marker>
  )
}

// ── Clique no mapa → novo marcador ───────────────────────────────────────────

function MapClickHandler({
  onAdd,
  apiKey,
}: {
  onAdd: (lat: number, lon: number, label: string, city?: string, country?: string) => void
  apiKey: string
}) {
  useMapEvents({
    click(e) {
      const target = e.originalEvent.target as HTMLElement
      if (
        target instanceof SVGElement ||
        target instanceof SVGPathElement ||
        target.closest('.leaflet-marker-icon') ||
        target.closest('.leaflet-marker-shadow') ||
        target.closest('.leaflet-popup') ||
        target.closest('.leaflet-popup-content-wrapper') ||
        target.closest('.leaflet-popup-tip-container')
      ) {
        return
      }
      const { lat, lng } = e.latlng
      const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`

      if (!apiKey) {
        onAdd(lat, lng, coords)
        return
      }

      fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`
      )
        .then((r) => r.json())
        .then((data) => {
          const nearest = Array.isArray(data) && data[0]
          onAdd(lat, lng, coords, nearest?.name, nearest?.country)
        })
        .catch(() => onAdd(lat, lng, coords))
    },
  })
  return null
}

// ── Popup com clima do marcador ──────────────────────────────────────────────

function MarkerPopupContent({
  marker,
  onRemove,
  hideRemove = false,
}: {
  marker: MapMarker
  onRemove: (id: string) => void
  hideRemove?: boolean
}) {
  const { data: weather, isLoading, isError } = useWeatherByCoords(marker.lat, marker.lon)

  return (
    <div className="min-w-[200px] p-1">
      <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{marker.label}</p>

      {marker.city && marker.city !== marker.label && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">Dados de {marker.city}</p>
      )}
      {isLoading && <p className="text-sm text-gray-500 dark:text-slate-400">Carregando...</p>}
      {isError && (
        <p className="text-xs text-gray-400 dark:text-slate-500">Sem dados de clima disponíveis</p>
      )}
      {weather && (
        <div className="space-y-1 text-sm">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatTemperature(weather.temperature)}
          </p>
          <p className="capitalize text-gray-600 dark:text-slate-300">{weather.description}</p>
          <p className="text-gray-500 dark:text-slate-400">
            Sensação: {formatTemperature(weather.feelsLike)}
          </p>
          <p className="text-gray-500 dark:text-slate-400">Umidade: {weather.humidity}%</p>
          <p className="text-gray-500 dark:text-slate-400">
            Vento: {formatWindSpeed(weather.windSpeed)}
            {weather.windDirection ? ` · ${weather.windDirection}` : ''}
          </p>
        </div>
      )}

      {hideRemove && (
        <p className="mt-2 text-xs text-gray-400 dark:text-slate-500 italic">
          Cidade selecionada no Painel de Clima
        </p>
      )}

      {!hideRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            e.nativeEvent.stopImmediatePropagation()
            onRemove(marker.id)
          }}
          className="mt-3 w-full rounded-md bg-red-50 px-2 py-2.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors min-h-[44px]"
        >
          Remover marcador
        </button>
      )}
    </div>
  )
}

// ── Painel de controle de camadas ────────────────────────────────────────────

function LayerControls({
  active,
  toggle,
}: {
  active: Set<LayerId>
  toggle: (id: LayerId) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current)
  }, [])

  return (
    <div ref={ref} style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}>
      <div className="rounded-xl bg-white/97 shadow-xl backdrop-blur-sm border border-gray-100 p-2 flex flex-col gap-1.5 min-w-[115px] dark:bg-slate-900/95 dark:border-slate-700">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest px-1 dark:text-slate-500">
          Camadas
        </p>
        {(Object.entries(LAYER_CONFIGS) as [LayerId, (typeof LAYER_CONFIGS)[LayerId]][]).map(
          ([id, cfg]) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                active.has(id)
                  ? cfg.activeClass
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              )}
            >
              <span>{cfg.emoji}</span>
              {cfg.label}
            </button>
          )
        )}
      </div>
    </div>
  )
}

// ── Legenda de cores ─────────────────────────────────────────────────────────

function MapLegend({ active }: { active: Set<LayerId> }) {
  const legendRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (legendRef.current) L.DomEvent.disableClickPropagation(legendRef.current)
  }, [])

  const activeLayers = (
    Object.entries(LAYER_CONFIGS) as [LayerId, (typeof LAYER_CONFIGS)[LayerId]][]
  ).filter(([id]) => active.has(id))
  if (activeLayers.length === 0) return null

  return (
    <div ref={legendRef} style={{ position: 'absolute', bottom: 28, right: 12, zIndex: 1000 }}>
      <div className="rounded-xl bg-white/97 shadow-xl backdrop-blur-sm border border-gray-100 p-3 flex flex-col gap-3 min-w-[168px] dark:bg-slate-900/95 dark:border-slate-700">
        {activeLayers.map(([id, cfg]) => (
          <div key={id}>
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 dark:text-slate-400">
              {cfg.emoji} {cfg.label}
            </p>
            <div
              className="h-2.5 rounded-full mb-1"
              style={{
                background: `linear-gradient(to right, ${cfg.legend.colors.join(', ')})`,
              }}
            />
            <div className="flex justify-between">
              {cfg.legend.labels.map((l, i) => (
                <span key={i} className="text-[9px] text-gray-400 dark:text-slate-500">
                  {l}
                </span>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-0.5 text-right dark:text-slate-500">
              {cfg.legend.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Alertas INMET ────────────────────────────────────────────────────────────

function normalizeStr(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

const SEVERITY_COLOR: Record<string, string> = {
  perigo: '#ef4444',
  perigo_potencial: '#f97316',
  atencao: '#eab308',
}

const SEVERITY_OPACITY: Record<string, number> = {
  perigo: 0.55,
  perigo_potencial: 0.45,
  atencao: 0.35,
}

const SEVERITY_LABEL: Record<string, string> = {
  perigo: 'Perigo',
  perigo_potencial: 'Perigo Potencial',
  atencao: 'Atencao',
}

function worstSeverity(list: InmetAlert[]): string {
  if (list.some((a) => a.severity === 'perigo')) return 'perigo'
  if (list.some((a) => a.severity === 'perigo_potencial')) return 'perigo_potencial'
  return 'atencao'
}

function InmetAlertsLayer() {
  const { data: alerts = [] } = useInmetAlerts()
  const { geoJson, mesoToUf, isLoading } = useIbgeStates()

  if (isLoading || !geoJson || alerts.length === 0) return null

  // Mapear UF → lista de alertas
  const ufAlerts: Record<string, InmetAlert[]> = {}
  for (const alert of alerts) {
    const ufs: string[] = []
    for (const area of alert.areas) {
      const uf = mesoToUf[normalizeStr(area)]
      if (uf && !ufs.includes(uf)) ufs.push(uf)
    }
    for (const uf of ufs) {
      if (!ufAlerts[uf]) ufAlerts[uf] = []
      ufAlerts[uf].push(alert)
    }
  }

  return (
    <GeoJSON
      key={alerts.map((a) => a.id).join(',')}
      data={geoJson}
      style={(feature) => {
        const sigla = feature?.properties?.sigla
        const list = sigla ? ufAlerts[sigla] : undefined
        if (!list || list.length === 0) return { fillOpacity: 0, opacity: 0, stroke: false }
        const severity = worstSeverity(list)
        return {
          fillColor: SEVERITY_COLOR[severity],
          fillOpacity: SEVERITY_OPACITY[severity],
          color: SEVERITY_COLOR[severity],
          weight: 1.5,
          opacity: 0.8,
        }
      }}
      onEachFeature={(feature, layer) => {
        const sigla = feature?.properties?.sigla
        const list = sigla ? ufAlerts[sigla] : undefined
        if (!list || list.length === 0) return

        const severity = worstSeverity(list)
        const popupHtml = `
          <div style="min-width:220px;max-width:280px;">
            <p style="font-weight:600;margin-bottom:8px;">${SEVERITY_LABEL[severity]} — ${sigla}</p>
            ${list
              .slice(0, 5)
              .map(
                (a) => `
              <div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #e2e8f0;">
                <p style="font-weight:500;font-size:13px;">${a.event}</p>
                <p style="font-size:11px;color:#64748b;margin:2px 0;">${a.start?.split(' ')[0] ?? ''} &rarr; ${a.end?.split(' ')[0] ?? ''}</p>
                <p style="font-size:11px;color:#475569;margin-top:4px;">${a.description?.slice(0, 120)}${(a.description?.length ?? 0) > 120 ? '...' : ''}</p>
              </div>`
              )
              .join('')}
            ${list.length > 5 ? `<p style="font-size:11px;color:#94a3b8;">+ ${list.length - 5} alertas</p>` : ''}
          </div>`

        layer.bindPopup(popupHtml, { maxWidth: 300 })
      }}
    />
  )
}

// ── Camadas meteorológicas ───────────────────────────────────────────────────

function WeatherLayers({ active, apiKey }: { active: Set<LayerId>; apiKey: string }) {
  const { data } = useWindField()

  return (
    <>
      {active.has('precipitation_new') && (
        <>
          <RainViewerLayer pane={LAYER_CONFIGS.precipitation_new.paneName} />
          <TileLayer
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`}
            opacity={0.55}
            pane={LAYER_CONFIGS.precipitation_new.paneName}
            className="wm-rain-tile"
          />
        </>
      )}

      {(['wind_new', 'temp_new', 'pressure_new'] as LayerId[])
        .filter((id) => active.has(id))
        .map((id) => {
          const cfg = LAYER_CONFIGS[id]
          return (
            <TileLayer
              key={id}
              url={`https://tile.openweathermap.org/map/${id}/{z}/{x}/{y}.png?appid=${apiKey}`}
              opacity={cfg.tileOpacity}
              pane={cfg.paneName}
              className={TILE_FILTER_CLASS[id] ?? ''}
              attribution='Weather &copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            />
          )
        })}

      {active.has('wind_new') && data?.velocityData && (
        <VelocityLayer data={data.velocityData} apiKey={apiKey} />
      )}

      {active.has('alerts_inmet') && <InmetAlertsLayer />}
    </>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function WeatherMap({
  initialLat = -14.235,
  initialLon = -51.925,
  initialZoom = 4,
  pendingMarker,
  onPendingMarkerConsumed,
  onMarkersChange,
  clearTrigger,
}: WeatherMapProps) {
  const [active, setActive] = useState<Set<LayerId>>(new Set())
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [flyTo, setFlyTo] = useState<{ lat: number; lon: number } | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? ''
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const tileUrl =
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  const tileAttribution =
    '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'

  const onMarkersChangeRef = useRef(onMarkersChange)
  onMarkersChangeRef.current = onMarkersChange
  useEffect(() => {
    onMarkersChangeRef.current?.(markers.length)
  }, [markers])

  const addMarker = (lat: number, lon: number, label: string, city?: string, country?: string) => {
    const newMarker: MapMarker = {
      id: `${Date.now()}-${Math.random()}`,
      lat,
      lon,
      label,
      city,
      country,
    }
    setMarkers((prev) => [...prev, newMarker])
  }

  const removeMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id))
  }

  useEffect(() => {
    if (!clearTrigger) return
    setMarkers([])
  }, [clearTrigger])

  const toggle = (id: LayerId) =>
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

  // Consome marcador pendente enviado pela página (fora do MapContainer)
  useEffect(() => {
    if (!pendingMarker) return
    addMarker(
      pendingMarker.lat,
      pendingMarker.lon,
      pendingMarker.name,
      pendingMarker.name,
      pendingMarker.country
    )
    setFlyTo({ lat: pendingMarker.lat, lon: pendingMarker.lon })
    onPendingMarkerConsumed?.()
  }, [pendingMarker]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{`
        @keyframes pulse-pin {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.75; }
        }
        .wm-rain-tile {
          filter: saturate(12) contrast(5) hue-rotate(195deg) brightness(1.4) !important;
        }
        .wm-temp-tile {
          filter: saturate(3) contrast(1.6) brightness(1.1) !important;
        }
        ${
          isDark
            ? `
        .leaflet-popup-content-wrapper {
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .leaflet-popup-tip {
          background: #1e293b;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
        .leaflet-popup-close-button:hover {
          color: #e2e8f0 !important;
        }
        `
            : ''
        }
      `}</style>

      <MapContainer
        center={[initialLat, initialLon]}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      >
        <CustomPanes />
        <MapAutoResize />
        <RainZoomGuard rainActive={active.has('precipitation_new')} />

        <TileLayer key={tileUrl} attribution={tileAttribution} url={tileUrl} />

        {/* Fronteiras de estados/países e nomes sobre o satélite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          pane="shadowPane"
        />

        {apiKey && <WeatherLayers active={active} apiKey={apiKey} />}

        <MapClickHandler onAdd={addMarker} apiKey={apiKey} />

        <SelectedCityMarker />

        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lon]}>
            <Popup>
              <MarkerPopupContent marker={marker} onRemove={removeMarker} />
            </Popup>
          </Marker>
        ))}

        {flyTo && <PanToCoords lat={flyTo.lat} lon={flyTo.lon} />}

        {apiKey && (
          <>
            <LayerControls active={active} toggle={toggle} />
            <MapLegend active={active} />
          </>
        )}
      </MapContainer>
    </>
  )
}
