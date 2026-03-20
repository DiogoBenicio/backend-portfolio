'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { formatTemperature, formatWindSpeed } from '@/lib/utils/weatherUtils'
import { cn } from '@/lib/utils/cn'

// Fix ícone padrão do Leaflet no Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CITIES = [
  { name: 'Uberlândia', lat: -18.9186, lng: -48.2772 },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
  { name: 'Brasília', lat: -15.7942, lng: -47.8825 },
  { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345 },
]

const WEATHER_LAYERS = [
  { id: 'precipitation_new', label: 'Chuva',  emoji: '🌧', activeClass: 'bg-blue-500 text-white' },
  { id: 'wind_new',          label: 'Vento',  emoji: '💨', activeClass: 'bg-teal-500 text-white' },
  { id: 'clouds_new',        label: 'Nuvens', emoji: '☁️', activeClass: 'bg-gray-500 text-white' },
] as const

type LayerId = (typeof WEATHER_LAYERS)[number]['id']
type CityPin = { name: string; lat: number; lng: number }

// ── Marcador de cidade ───────────────────────────────────────────────────────

function CityMarker({ city, highlighted = false }: { city: CityPin; highlighted?: boolean }) {
  const { data: weather, isLoading } = useCurrentWeather(city.name, 'BR')

  const icon = useMemo(() => {
    if (!highlighted) return new L.Icon.Default()
    return L.divIcon({
      className: '',
      html: `<div style="
        width:20px;height:20px;
        background:#ef4444;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 0 0 3px #ef4444,0 2px 6px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -14],
    })
  }, [highlighted])

  return (
    <Marker position={[city.lat, city.lng]} icon={icon}>
      <Popup>
        <div className="min-w-[180px] p-1">
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

// ── Camadas meteorológicas + painel de controle ──────────────────────────────

function WeatherLayerControl({ apiKey }: { apiKey: string }) {
  const [active, setActive] = useState<Set<LayerId>>(new Set())

  const toggle = (id: LayerId) =>
    setActive((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <>
      {/* Overlay tiles do OpenWeatherMap */}
      {WEATHER_LAYERS.filter((l) => active.has(l.id)).map((layer) => (
        <TileLayer
          key={layer.id}
          url={`https://tile.openweathermap.org/map/${layer.id}/{z}/{x}/{y}.png?appid=${apiKey}`}
          opacity={0.55}
          attribution='Weather &copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
        />
      ))}

      {/* Painel flutuante — stopPropagation impede conflito com eventos do mapa */}
      <div
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-xl bg-white/95 shadow-lg backdrop-blur-sm border border-gray-100 p-2 flex flex-col gap-1.5 min-w-[110px]">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest px-1">
            Camadas
          </p>
          {WEATHER_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => toggle(layer.id)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                active.has(layer.id)
                  ? layer.activeClass
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              )}
            >
              <span>{layer.emoji}</span>
              {layer.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function WeatherMap() {
  const [selectedCity, setSelectedCity] = useState<CityPin | null>(null)
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? ''

  useEffect(() => {
    const stored = localStorage.getItem('selectedMapCity')
    if (stored) {
      try { setSelectedCity(JSON.parse(stored)) } catch { /* ignorar */ }
    }
  }, [])

  const defaultCities = DEFAULT_CITIES.filter(
    (c) => c.name.toLowerCase() !== selectedCity?.name.toLowerCase()
  )

  return (
    <MapContainer
      center={[-15.7801, -47.9292]}
      zoom={4}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {apiKey && <WeatherLayerControl apiKey={apiKey} />}

      {defaultCities.map((city) => (
        <CityMarker key={city.name} city={city} />
      ))}

      {selectedCity && (
        <>
          <CityMarker key={`selected-${selectedCity.name}`} city={selectedCity} highlighted />
          <FlyToCity city={selectedCity} />
        </>
      )}
    </MapContainer>
  )
}
