import { useQuery } from '@tanstack/react-query'

// IDs de cidades brasileiras no OpenWeatherMap (endpoint /group aceita até 20)
const CITY_IDS = [
  3448439, // São Paulo
  3451190, // Rio de Janeiro
  3469058, // Brasília
  3470127, // Belo Horizonte
  3450554, // Salvador
  3399415, // Fortaleza
  3663517, // Manaus
  3407730,  // Belém
  3452925, // Porto Alegre
  3390760, // Recife
  3445831, // Uberlândia
  3464975, // Curitiba
  3462372, // Goiânia
  3394429, // Natal
  3386368, // Teresina
  3467747, // Campo Grande
  3671660, // Porto Velho
  3458417, // Florianópolis
  3471075, // Aracaju
  3387580, // São Luís
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
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/group?id=${CITY_IDS.join(',')}&appid=${apiKey}&units=metric`,
      )
      if (!res.ok) throw new Error('Erro ao buscar dados de vento')
      const json = await res.json()

      const cities: CityWind[] = (json.list ?? [])
        .filter((item: { wind?: { speed?: number; deg?: number } }) => item.wind?.speed != null && item.wind?.deg != null)
        .map((item: { coord: { lat: number; lon: number }; wind: { speed: number; deg: number } }) => {
          const rad = (item.wind.deg * Math.PI) / 180
          return {
            lat: item.coord.lat,
            lng: item.coord.lon,
            u: -item.wind.speed * Math.sin(rad),
            v: -item.wind.speed * Math.cos(rad),
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
