import { useQuery } from '@tanstack/react-query'
import type { CurrentWeather } from '@/types/weather'

interface OWMResponse {
  name: string
  sys: { country: string }
  coord: { lat: number; lon: number }
  main: { temp: number; feels_like: number; humidity: number; pressure: number }
  wind: { speed: number; deg?: number }
  weather: { description: string; icon: string }[]
  rain?: { '1h'?: number }
  dt: number
}

const WIND_DIRS = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']

function degToDir(deg: number): string {
  return WIND_DIRS[Math.round(deg / 45) % 8]
}

function mapToCurrentWeather(data: OWMResponse): CurrentWeather {
  return {
    city: data.name,
    country: data.sys.country,
    latitude: data.coord.lat,
    longitude: data.coord.lon,
    temperature: data.main.temp,
    feelsLike: data.main.feels_like,
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: data.wind.speed,
    windDirection: data.wind.deg != null ? degToDir(data.wind.deg) : '',
    description: data.weather[0]?.description ?? '',
    icon: data.weather[0]?.icon ?? '',
    uvIndex: 0,
    rainfall: data.rain?.['1h'] ?? 0,
    timestamp: new Date(data.dt * 1000).toISOString(),
  }
}

export function useWeatherByCoords(lat: number, lon: number) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? ''

  return useQuery<CurrentWeather>({
    queryKey: ['weather', 'coords', lat, lon],
    queryFn: async () => {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`OpenWeather ${res.status}`)
      const data: OWMResponse = await res.json()
      return mapToCurrentWeather(data)
    },
    enabled: !!apiKey && !isNaN(lat) && !isNaN(lon),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
