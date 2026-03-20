import type { NpsZone } from '@/types/nps'

export function getNpsZoneColor(zone: NpsZone): string {
  const colors: Record<NpsZone, string> = {
    Crítico: 'text-red-500',
    Aperfeiçoamento: 'text-yellow-500',
    Qualidade: 'text-blue-500',
    Excelência: 'text-green-500',
  }
  return colors[zone]
}

export function getNpsZoneBg(zone: NpsZone): string {
  const colors: Record<NpsZone, string> = {
    Crítico: 'bg-red-50 border-red-200',
    Aperfeiçoamento: 'bg-yellow-50 border-yellow-200',
    Qualidade: 'bg-blue-50 border-blue-200',
    Excelência: 'bg-green-50 border-green-200',
  }
  return colors[zone]
}

export function getScoreCategory(score: number): { label: string; color: string } {
  if (score >= 9) return { label: 'Promotor', color: 'bg-green-500' }
  if (score >= 7) return { label: 'Passivo', color: 'bg-yellow-500' }
  return { label: 'Detrator', color: 'bg-red-500' }
}
