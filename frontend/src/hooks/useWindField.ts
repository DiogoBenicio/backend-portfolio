import { useQuery } from '@tanstack/react-query'

// Cidades para construir o campo de vento — /weather individual (plano gratuito OWM)
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

// Grade regular cobrindo o Brasil
const GRID = { la1: 6, la2: -36, lo1: -74, lo2: -28, nx: 24, ny: 22 } as const

interface CityWind {
  lat: number
  lng: number
  u: number // componente eastward (m/s)
  v: number // componente northward (m/s)
}

function buildVelocityData(cities: CityWind[]) {
  const { la1, la2, lo1, lo2, nx, ny } = GRID
  const dlat = (la1 - la2) / (ny - 1)
  const dlon = (lo2 - lo1) / (nx - 1)

  const uData: number[] = []
  const vData: number[] = []

  // Interpolação IDW (Inverse Distance Weighting) sobre a grade
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
    { header: { ...header, parameterNumber: 2 }, data: uData }, // U component
    { header: { ...header, parameterNumber: 3 }, data: vData }, // V component
  ]
}

export function useWindField(apiKey: string) {
  return useQuery({
    queryKey: ['windField'],
    queryFn: async () => {
      // Chamadas individuais em paralelo — endpoint /weather disponível no plano gratuito
      const results = await Promise.allSettled(
        WIND_CITIES.map((city) =>
          fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
          ).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        )
      )

      type CityWeatherItem = {
        coord: { lat: number; lon: number }
        wind?: { speed: number; deg: number }
      }

      const cities: CityWind[] = results
        .filter(
          (r): r is PromiseFulfilledResult<CityWeatherItem> =>
            r.status === 'fulfilled' && r.value?.wind?.speed != null
        )
        .map((r) => {
          const { coord, wind } = r.value
          const rad = (wind!.deg * Math.PI) / 180
          return {
            lat: coord.lat,
            lng: coord.lon,
            u: -wind!.speed * Math.sin(rad),
            v: -wind!.speed * Math.cos(rad),
          }
        })

      if (cities.length < 3) throw new Error('Dados insuficientes de vento')
      return buildVelocityData(cities)
    },
    enabled: !!apiKey,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  })
}
