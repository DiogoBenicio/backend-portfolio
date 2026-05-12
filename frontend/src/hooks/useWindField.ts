import { useQuery } from '@tanstack/react-query'

const GRID = { la1: 90, la2: -90, lo1: -180, lo2: 180, nx: 180, ny: 91 } as const

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

interface WindFieldApiResponse {
  cities: CityWind[]
  rainZones: RainZone[]
}

export function useWindField() {
  return useQuery({
    queryKey: ['windField'],
    queryFn: async () => {
      const res = await fetch('/api/weather/windfield')
      if (!res.ok) throw new Error(`windfield error: ${res.status}`)
      const data: WindFieldApiResponse = await res.json()

      if (data.cities.length < 3) throw new Error('Dados insuficientes')

      return {
        velocityData: buildVelocityData(data.cities),
        rainZones: data.rainZones,
      }
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  })
}
