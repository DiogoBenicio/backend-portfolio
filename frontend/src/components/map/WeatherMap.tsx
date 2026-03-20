'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { useWindField } from '@/hooks/useWindField'
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

// ── Configuração das camadas ──────────────────────────────────────────────────

// Fundo sólido para o pane de chuva (preenche pixels transparentes do tile)
const PANE_BACKGROUNDS: Record<string, string> = {
  precipPane: '#050e24',
}

// Filtro CSS aplicado ao tile via className (não afeta o fundo do pane)
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
      // Cores reais do RainViewer colorScheme 4 (Meteored)
      colors: ['#9ecae1', '#3d9bff', '#1a5ccc', '#f5e642', '#ff5200'],
      labels: ['Leve', '', 'Mod.', '', 'Forte'],
      unit: 'mm/h',
    },
  },
  wind_new: {
    label: 'Vento',
    emoji: '💨',
    activeClass: 'bg-teal-500 text-white',
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
    activeClass: 'bg-purple-500 text-white',
    paneName: 'pressPane',
    renderType: 'tile' as const,
    tileOpacity: 0.82,
    legend: {
      colors: ['#6b48ff', '#3f51b5', '#00bcd4', '#66bb6a', '#ff9800', '#f44336'],
      labels: ['960', '980', '1000', '1013', '1030', '1050+'],
      unit: 'hPa',
    },
  },
} as const

type LayerId = keyof typeof LAYER_CONFIGS
type CityPin = { name: string; lat: number; lng: number }

const DEFAULT_CITIES: CityPin[] = [
  { name: 'Uberlândia', lat: -18.9186, lng: -48.2772 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Brasília', lat: -15.7942, lng: -47.8825 },
  { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
]

// ── Setup de panes ────────────────────────────────────────────────────────────

function CustomPanes() {
  const map = useMap()
  useEffect(() => {
    for (const [id, cfg] of Object.entries(LAYER_CONFIGS)) {
      if (!map.getPane(cfg.paneName)) {
        const pane = map.createPane(cfg.paneName)
        pane.style.zIndex = String(400 + Object.keys(LAYER_CONFIGS).indexOf(id))
        // Fundo sólido: preenche as áreas sem dados do tile OWM (pixels transparentes)
        const bg = PANE_BACKGROUNDS[cfg.paneName]
        if (bg) pane.style.backgroundColor = bg
      }
    }
  }, [map])
  return null
}

// ── RainViewer — radar real (sem API key, gratuito) ──────────────────────────

function RainViewerLayer({ pane }: { pane: string }) {
  const [tileUrl, setTileUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((data) => {
        const latest: string | undefined = data.radar?.past?.at(-1)?.path
        if (latest) {
          // colorScheme 4 = verde→amarelo→laranja→vermelho (padrão radar)
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

// ── Animação de gotas de chuva (canvas) ──────────────────────────────────────

function RainAnimation() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()

    const canvas = document.createElement('canvas')
    canvas.style.cssText =
      'position:absolute;top:0;left:0;pointer-events:none;z-index:450;border-radius:0.75rem;'
    container.appendChild(canvas)

    type Drop = { x: number; y: number; speed: number; len: number; opacity: number }
    let drops: Drop[] = []
    let animId: number

    function init() {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      drops = Array.from({ length: 220 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 5 + Math.random() * 8,
        len: 12 + Math.random() * 18,
        opacity: 0.18 + Math.random() * 0.52,
      }))
    }

    function draw() {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const d of drops) {
        ctx.beginPath()
        // Ângulo leve para simular vento (15°)
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - d.len * 0.27, d.y + d.len)
        ctx.strokeStyle = `rgba(147, 210, 255, ${d.opacity})`
        ctx.lineWidth = 1.4
        ctx.lineCap = 'round'
        ctx.stroke()

        d.y += d.speed
        d.x -= d.speed * 0.27

        if (d.y > canvas.height + d.len) {
          d.y = -d.len - Math.random() * 40
          d.x = Math.random() * (canvas.width + 60)
        }
        if (d.x < -30) d.x = canvas.width + Math.random() * 40
      }

      animId = requestAnimationFrame(draw)
    }

    init()
    draw()

    const ro = new ResizeObserver(init)
    ro.observe(container)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
      canvas.remove()
    }
  }, [map])

  return null
}

// ── Camada de partículas de vento (leaflet-velocity) ─────────────────────────

function VelocityLayer({ data, apiKey }: { data: unknown; apiKey: string }) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (!data) return
    let cancelled = false

    velocityReady.then(() => {
      if (cancelled) return
      try {
        if (layerRef.current) {
          map.removeLayer(layerRef.current)
          layerRef.current = null
        }
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
  }, [map, data, apiKey])

  return null
}

// ── Marcador de cidade ───────────────────────────────────────────────────────

function CityMarker({ city, highlighted = false }: { city: CityPin; highlighted?: boolean }) {
  const { data: weather, isLoading } = useCurrentWeather(city.name, 'BR')

  const icon = useMemo(() => {
    if (!highlighted) return new L.Icon.Default()
    return L.divIcon({
      className: '',
      html: `<div style="
        width:22px;height:22px;
        background:#ef4444;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 0 3px #ef4444,0 2px 8px rgba(0,0,0,0.5);
        animation:pulse-pin 1.6s ease-in-out infinite;
      "></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -16],
    })
  }, [highlighted])

  return (
    <Marker position={[city.lat, city.lng]} icon={icon}>
      <Popup>
        <div className="min-w-[190px] p-1">
          <div className="flex items-center gap-1.5">
            {highlighted && <span className="inline-block h-2 w-2 rounded-full bg-red-500" />}
            <p className="font-semibold text-gray-900">{city.name}</p>
          </div>
          {highlighted && (
            <p className="text-[10px] text-red-500 mb-1">cidade selecionada no dashboard</p>
          )}
          {isLoading && <p className="text-sm text-gray-500">Carregando...</p>}
          {weather && (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-2xl font-bold text-blue-600">
                {formatTemperature(weather.temperature)}
              </p>
              <p className="capitalize text-gray-600">{weather.description}</p>
              <p className="text-gray-500">Umidade: {weather.humidity}%</p>
              <p className="text-gray-500">Vento: {formatWindSpeed(weather.windSpeed)}</p>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}

// ── Voa para cidade selecionada ──────────────────────────────────────────────

function FlyToCity({ city }: { city: CityPin }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([city.lat, city.lng], 8, { duration: 1.5 })
  }, [map, city.lat, city.lng])
  return null
}

// ── Painel de controle de camadas ────────────────────────────────────────────

function LayerControls({
  active,
  toggle,
}: {
  active: Set<LayerId>
  toggle: (id: LayerId) => void
}) {
  return (
    <div
      style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="rounded-xl bg-white/97 shadow-xl backdrop-blur-sm border border-gray-100 p-2 flex flex-col gap-1.5 min-w-[115px]">
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest px-1">
          Camadas
        </p>
        {(Object.entries(LAYER_CONFIGS) as [LayerId, (typeof LAYER_CONFIGS)[LayerId]][]).map(
          ([id, cfg]) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                active.has(id) ? cfg.activeClass : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
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
  const activeLayers = (
    Object.entries(LAYER_CONFIGS) as [LayerId, (typeof LAYER_CONFIGS)[LayerId]][]
  ).filter(([id]) => active.has(id))
  if (activeLayers.length === 0) return null

  return (
    <div
      style={{ position: 'absolute', bottom: 28, right: 12, zIndex: 1000 }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="rounded-xl bg-white/97 shadow-xl backdrop-blur-sm border border-gray-100 p-3 flex flex-col gap-3 min-w-[168px]">
        {activeLayers.map(([id, cfg]) => (
          <div key={id}>
            <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              {cfg.emoji} {cfg.label}
            </p>

            {/* Barra de gradiente para todas as camadas */}
            <div
              className="h-2.5 rounded-full mb-1"
              style={{
                background: `linear-gradient(to right, ${cfg.legend.colors.join(', ')})`,
              }}
            />
            <div className="flex justify-between">
              {cfg.legend.labels.map((l, i) => (
                <span key={i} className="text-[9px] text-gray-400">
                  {l}
                </span>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-0.5 text-right">{cfg.legend.unit}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Camadas meteorológicas ───────────────────────────────────────────────────

function WeatherLayers({ active, apiKey }: { active: Set<LayerId>; apiKey: string }) {
  const { data } = useWindField(apiKey)

  return (
    <>
      {/* Chuva: radar RainViewer + precipitação acumulada OWM sobrepostos */}
      {active.has('precipitation_new') && (
        <>
          <RainViewerLayer pane={LAYER_CONFIGS.precipitation_new.paneName} />
          {/* Accumulated precipitation — intensifica zonas de chuva persistente */}
          <TileLayer
            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`}
            opacity={0.55}
            pane={LAYER_CONFIGS.precipitation_new.paneName}
            className="wm-rain-tile"
          />
        </>
      )}

      {/* Vento, temperatura, umidade, pressão: tiles OWM */}
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

      {/* Partículas animadas de vento */}
      {active.has('wind_new') && data?.velocityData && (
        <VelocityLayer data={data.velocityData} apiKey={apiKey} />
      )}
    </>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function WeatherMap() {
  const [selectedCity, setSelectedCity] = useState<CityPin | null>(null)
  const [active, setActive] = useState<Set<LayerId>>(new Set())
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? ''

  useEffect(() => {
    const stored = localStorage.getItem('selectedMapCity')
    if (stored) {
      try {
        setSelectedCity(JSON.parse(stored))
      } catch {
        /* ignorar */
      }
    }
  }, [])

  const toggle = (id: LayerId) =>
    setActive((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const defaultCities = DEFAULT_CITIES.filter(
    (c) => c.name.toLowerCase() !== selectedCity?.name.toLowerCase()
  )

  return (
    <>
      <style>{`
        @keyframes pulse-pin {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.75; }
        }
        /* Filtros por tile — aplicados ao tile, não ao fundo do pane */
        .wm-rain-tile {
          filter: saturate(12) contrast(5) hue-rotate(195deg) brightness(1.4) !important;
        }
        .wm-temp-tile {
          filter: saturate(3) contrast(1.6) brightness(1.1) !important;
        }
      `}</style>

      <MapContainer
        center={[-15.7801, -47.9292]}
        zoom={4}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
      >
        <CustomPanes />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {apiKey && <WeatherLayers active={active} apiKey={apiKey} />}

        {defaultCities.map((city) => (
          <CityMarker key={city.name} city={city} />
        ))}

        {selectedCity && (
          <>
            <CityMarker key={`sel-${selectedCity.name}`} city={selectedCity} highlighted />
            <FlyToCity city={selectedCity} />
          </>
        )}

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
