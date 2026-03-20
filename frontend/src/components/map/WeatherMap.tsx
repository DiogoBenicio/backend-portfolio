'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { formatTemperature, formatWindSpeed } from '@/lib/utils/weatherUtils'

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

function CityMarker({ city }: { city: { name: string; lat: number; lng: number } }) {
  const { data: weather, isLoading } = useCurrentWeather(city.name, 'BR')

  return (
    <Marker position={[city.lat, city.lng]}>
      <Popup>
        <div className="min-w-[180px] p-1">
          <p className="font-semibold text-gray-900">{city.name}</p>
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

export function WeatherMap() {
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
      {DEFAULT_CITIES.map((city) => (
        <CityMarker key={city.name} city={city} />
      ))}
    </MapContainer>
  )
}
