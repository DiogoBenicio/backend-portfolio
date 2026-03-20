import { useQuery } from '@tanstack/react-query'

// Cidades usadas para campo de vento e zonas de chuva
const WIND_CITIES = [
  'Uberlândia,BR',
  'Sao Paulo,BR',
  'Rio de Janeiro,BR',
  'Brasilia,BR',
  'Belo Horizonte,BR',
  'Salvador,BR',
  'Fortaleza,BR',
  'Manaus,BR',
  'Porto Alegre,BR',
  'Recife,BR',
  'Curitiba,BR',
  'Goiania,BR',
]

const GRID = { la1: 6, la2: -36, lo1: -74, lo2: -28, nx: 24, ny: 22 } as const

interface CityWind {
  lat: number
  lng: number
  u: number
  v: number
}

export interface RainZone {
  lat: number
  lng: number
  name: string
  rainMmPerHour: number
  intensity: 'fraca' | 'moderada' | 'forte'
}

function buildVelocityData(cities: CityWind[]) {
  const { la1, la2, lo1, lo2, nx, ny } = GRID
  const dlat = (la1 - la2) / (ny - 1)
  const dlon = (lo2 - lo1) / (nx - 1)
  const uData: number[] = []
  const vData: number[] = []

  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const lat = la1 - j * dlat
      const lon = lo1 + i * dlon
      let uSum = 0,
        vSum = 0,
        wSum = 0
      for (const c of cities) {
        const d2 = (lat - c.lat) ** 2 + (lon - c.lng) ** 2
        const w = 1 / (d2 + 0.25)
        uSum += c.u * w
        vSum += c.v * w
        wSum += w
      }
      uData.push(uSum / wSum)
      vData.push(vSum / wSum)
    }
  }

  const header = {
    parameterCategory: 2,
    lo1: GRID.lo1,
    lo2: GRID.lo2,
    la1: GRID.la1,
    la2: GRID.la2,
    dx: dlon,
    dy: dlat,
    nx: GRID.nx,
    ny: GRID.ny,
  }

  return [
    { header: { ...header, parameterNumber: 2 }, data: uData },
    { header: { ...header, parameterNumber: 3 }, data: vData },
  ]
}

type OWMItem = {
  name: string
  coord: { lat: number; lon: number }
  wind?: { speed: number; deg: number }
  rain?: { '1h'?: number; '3h'?: number }
}

export function useWindField(apiKey: string) {
  return useQuery({
    queryKey: ['windField'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        WIND_CITIES.map((city) =>
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
          ).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        )
      )

      const items: OWMItem[] = results
        .filter((r): r is PromiseFulfilledResult<OWMItem> => r.status === 'fulfilled')
        .map((r) => r.value)

      // Campo de vento (IDW)
      const windCities: CityWind[] = items
        .filter((item) => item.wind?.speed != null)
        .map((item) => {
          const rad = (item.wind!.deg * Math.PI) / 180
          return {
            lat: item.coord.lat,
            lng: item.coord.lon,
            u: -item.wind!.speed * Math.sin(rad),
            v: -item.wind!.speed * Math.cos(rad),
          }
        })

      // Zonas de chuva por intensidade
      const rainZones: RainZone[] = items
        .map((item) => {
          const mm = item.rain?.['1h'] ?? item.rain?.['3h'] ?? 0
          if (mm < 0.1) return null
          return {
            lat: item.coord.lat,
            lng: item.coord.lon,
            name: item.name,
            rainMmPerHour: mm,
            intensity:
              mm < 2.5 ? ('fraca' as const) : mm < 7.5 ? ('moderada' as const) : ('forte' as const),
          }
        })
        .filter((z): z is RainZone => z !== null)

      if (windCities.length < 3) throw new Error('Dados insuficientes')

      return { velocityData: buildVelocityData(windCities), rainZones }
    },
    enabled: !!apiKey,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  })
}
