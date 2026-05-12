import { useQuery } from '@tanstack/react-query'

interface MesoregiaoBr {
  id: number
  nome: string
  UF: { sigla: string }
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function useIbgeStates() {
  // GeoJSON dos 27 estados
  const geoQuery = useQuery({
    queryKey: ['ibge-states-geo'],
    queryFn: () =>
      fetch(
        'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson'
      ).then((r) => r.json()),
    staleTime: Infinity,
  })

  // Lista de mesorregiões com UF para fazer o lookup nome→UF
  const mesoQuery = useQuery({
    queryKey: ['ibge-mesorregioes'],
    queryFn: () =>
      fetch('https://servicodados.ibge.gov.br/api/v1/localidades/mesorregioes').then((r) =>
        r.json()
      ) as Promise<MesoregiaoBr[]>,
    staleTime: Infinity,
  })

  // Mapa: nome normalizado de mesorregião → sigla UF
  const mesoToUf = useQuery({
    queryKey: ['ibge-meso-to-uf', mesoQuery.data],
    queryFn: () => {
      const map: Record<string, string> = {}
      for (const m of mesoQuery.data ?? []) {
        map[normalize(m.nome)] = m.UF.sigla
      }
      return map
    },
    enabled: !!mesoQuery.data,
    staleTime: Infinity,
  })

  return {
    geoJson: geoQuery.data,
    mesoToUf: mesoToUf.data ?? {},
    isLoading: geoQuery.isLoading || mesoQuery.isLoading,
  }
}
