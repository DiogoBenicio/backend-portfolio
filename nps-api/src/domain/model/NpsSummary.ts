export type NpsZone = 'Crítico' | 'Aperfeiçoamento' | 'Qualidade' | 'Excelência';

export interface NpsSummary {
  page: string;
  totalResponses: number;
  npsScore: number;
  zone: NpsZone;
  promoters: number;
  passives: number;
  detractors: number;
  distribution: Record<number, number>;
}

export function classifyScore(score: number): 'promoter' | 'passive' | 'detractor' {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

export function calculateNps(promoters: number, detractors: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((promoters - detractors) / total) * 100 * 10) / 10;
}

export function getZone(npsScore: number): NpsZone {
  if (npsScore <= 0) return 'Crítico';
  if (npsScore <= 50) return 'Aperfeiçoamento';
  if (npsScore <= 75) return 'Qualidade';
  return 'Excelência';
}
