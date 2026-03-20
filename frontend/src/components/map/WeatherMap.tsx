'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { useWindField, type RainZone } from '@/hooks/useWindField'
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

// ── Intensidades de chuva ────────────────────────────────────────────────────

const RAIN_LEVELS = {
  fraca: {
    label: 'Chuva fraca',
    color: '#22d3ee',
    fillOpacity: 0.38,
    strokeOpacity: 0.7,
    radius: 65_000,
  },
  moderada: {
    label: 'Chuva moderada',
    color: '#3b82f6',
    fillOpacity: 0.55,
    strokeOpacity: 0.85,
    radius: 85_000,
  },
  forte: {
    label: 'Chuva forte',
    color: '#6366f1',
    fillOpacity: 0.72,
    strokeOpacity: 1,
    radius: 110_000,
  },
} as const

// ── Configuração das camadas ──────────────────────────────────────────────────

const LAYER_CONFIGS = {
  precipitation_new: {
    label: 'Chuva',
    emoji: '🌧',
    activeClass: 'bg-blue-600 text-white',
    paneName: 'precipPane',
    renderType: 'zones' as const,
    legend: {
      colors: ['#22d3ee', '#3b82f6', '#6366f1'],
      labels: ['Fraca', 'Moderada', 'Forte'],
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
    cssFilter: 'none',
    legend: {
      colors: ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c'],
      labels: ['0', '3', '8', '15', '25+'],
      unit: 'm/s',
    },
  },
  clouds_new: {
    label: 'Nuvens',
    emoji: '☁️',
    activeClass: 'bg-slate-600 text-white',
    paneName: 'cloudPane',
    renderType: 'tile' as const,
    tileOpacity: 0.92,
    cssFilter: 'contrast(2.8) brightness(0.65) saturate(1.6)',
    legend: {
      colors: ['#ebebeb', '#b0b0b0', '#717171', '#383838', '#0a0a0a'],
      labels: ['0', '25', '50', '75', '100'],
      unit: '%',
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

// ── Setup de panes com filtros CSS ───────────────────────────────────────────

function CustomPanes() {
  const map = useMap()
  useEffect(() => {
    for (const [id, cfg] of Object.entries(LAYER_CONFIGS)) {
      if (!map.getPane(cfg.paneName)) {
        const pane = map.createPane(cfg.paneName)
        pane.style.zIndex = String(400 + Object.keys(LAYER_CONFIGS).indexOf(id))
        if (cfg.renderType === 'tile' && cfg.cssFilter !== 'none') {
          pane.style.filter = cfg.cssFilter
        }
      }
    }
  }, [map])
  return null
}

// ── Zonas de chuva coloridas por intensidade ─────────────────────────────────

function RainZones({ zones }: { zones: RainZone[] }) {
  if (zones.length === 0) return null
  return (
    <>
      {zones.map((zone) => {
        const level = RAIN_LEVELS[zone.intensity]
        return (
          <Circle
            key={zone.name}
            center={[zone.lat, zone.lng]}
            radius={level.radius}
            pathOptions={{
              color: level.color,
              fillColor: level.color,
              fillOpacity: level.fillOpacity,
              weight: 2,
              opacity: level.strokeOpacity,
            }}
          >
            <Popup>
              <div className="text-sm min-w-[160px]">
                <p className="font-semibold text-gray-900">{zone.name}</p>
                <p className="font-medium mt-1" style={{ color: level.color }}>
                  {level.label}: {zone.rainMmPerHour.toFixed(1)} mm/h
                </p>
              </div>
            </Popup>
          </Circle>
        )
      })}
    </>
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

            {/* Chuva: 3 caixas coloridas com label */}
            {id === 'precipitation_new' ? (
              <div className="flex flex-col gap-1">
                {cfg.legend.labels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: cfg.legend.colors[i], opacity: 0.85 }}
                    />
                    <span className="text-[10px] text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* Outros: barra de gradiente */
              <>
                <div
                  className="h-2.5 rounded-full mb-1"
                  style={{
                    background: `linear-gradient(to right, ${cfg.legend.colors.join(', ')})`,
                  }}
                />
                <div className="flex justify-between">
                  {cfg.legend.labels.map((l) => (
                    <span key={l} className="text-[9px] text-gray-400">
                      {l}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5 text-right">{cfg.legend.unit}</p>
              </>
            )}
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
      {/* Tiles para vento e nuvens */}
      {(['wind_new', 'clouds_new'] as LayerId[])
        .filter((id) => active.has(id))
        .map((id) => {
          const cfg = LAYER_CONFIGS[id]
          if (cfg.renderType !== 'tile') return null
          return (
            <TileLayer
              key={id}
              url={`https://tile.openweathermap.org/map/${id}/{z}/{x}/{y}.png?appid=${apiKey}`}
              opacity={cfg.tileOpacity}
              pane={cfg.paneName}
              attribution='Weather &copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            />
          )
        })}

      {/* Chuva: zonas coloridas por intensidade + animação de gotas */}
      {active.has('precipitation_new') && (
        <>
          <RainZones zones={data?.rainZones ?? []} />
          <RainAnimation />
        </>
      )}

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
