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
    Crítico:
      'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
    Aperfeiçoamento:
      'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
    Qualidade:
      'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
    Excelência:
      'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
  }
  return colors[zone]
}

export function getScoreCategory(score: number): { label: string; color: string } {
  if (score >= 9) return { label: 'Promotor', color: 'bg-green-500' }
  if (score >= 7) return { label: 'Passivo', color: 'bg-yellow-500' }
  return { label: 'Detrator', color: 'bg-red-500' }
}
