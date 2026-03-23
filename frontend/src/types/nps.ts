export type NpsZone = 'Crítico' | 'Aperfeiçoamento' | 'Qualidade' | 'Excelência'

export interface NpsSummary {
  page: string
  totalResponses: number
  npsScore: number
  zone: NpsZone
  promoters: number
  passives: number
  detractors: number
  distribution: Record<number, number>
}

export interface NpsResponseItem {
  id: string
  score: number
  comment?: string | null
  name?: string | null
  page: string
  createdAt: string
}

export interface NpsListResult {
  data: NpsResponseItem[]
  total: number
  limit: number
  offset: number
}

export interface SubmitNpsInput {
  score: number
  comment?: string
  name?: string
  page?: string
}
