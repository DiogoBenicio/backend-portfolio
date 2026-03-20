// Pure domain logic extracted from nps-api — replicada nos tipos do frontend
// Testa a lógica de classificação que os hooks expõem via NpsSummary

import { describe, it, expect } from 'vitest'

// Funções puras replicadas no frontend (mesma lógica do nps-api)
function classifyScore(score: number): 'promoter' | 'passive' | 'detractor' {
  if (score >= 9) return 'promoter'
  if (score >= 7) return 'passive'
  return 'detractor'
}

function getZoneLabel(npsScore: number): string {
  if (npsScore <= 0) return 'Crítico'
  if (npsScore <= 50) return 'Aperfeiçoamento'
  if (npsScore <= 75) return 'Qualidade'
  return 'Excelência'
}

describe('classifyScore', () => {
  it.each([9, 10])('score %i → promoter', (s) => expect(classifyScore(s)).toBe('promoter'))
  it.each([7, 8])('score %i → passive', (s) => expect(classifyScore(s)).toBe('passive'))
  it.each([0, 1, 6])('score %i → detractor', (s) => expect(classifyScore(s)).toBe('detractor'))
})

describe('getZoneLabel', () => {
  it('0 → Crítico', () => expect(getZoneLabel(0)).toBe('Crítico'))
  it('50 → Aperfeiçoamento', () => expect(getZoneLabel(50)).toBe('Aperfeiçoamento'))
  it('75 → Qualidade', () => expect(getZoneLabel(75)).toBe('Qualidade'))
  it('100 → Excelência', () => expect(getZoneLabel(100)).toBe('Excelência'))
})
