import { describe, it, expect } from 'vitest'
import { getNpsZoneColor, getNpsZoneBg, getScoreCategory } from '@/lib/utils/npsUtils'

describe('getNpsZoneColor', () => {
  it.each([
    ['Crítico', 'text-red-500'],
    ['Aperfeiçoamento', 'text-yellow-500'],
    ['Qualidade', 'text-blue-500'],
    ['Excelência', 'text-green-500'],
  ] as const)('zona %s → classe %s', (zone, cls) => {
    expect(getNpsZoneColor(zone)).toBe(cls)
  })
})

describe('getNpsZoneBg', () => {
  it('deve retornar classe bg para Crítico', () => {
    expect(getNpsZoneBg('Crítico')).toContain('bg-red-50')
  })

  it('deve retornar classe bg para Excelência', () => {
    expect(getNpsZoneBg('Excelência')).toContain('bg-green-50')
  })

  it('deve retornar classe bg para Aperfeiçoamento', () => {
    expect(getNpsZoneBg('Aperfeiçoamento')).toContain('bg-yellow-50')
  })

  it('deve retornar classe bg para Qualidade', () => {
    expect(getNpsZoneBg('Qualidade')).toContain('bg-blue-50')
  })
})

describe('getScoreCategory', () => {
  it.each([
    [9, 'Promotor', 'bg-green-500'],
    [10, 'Promotor', 'bg-green-500'],
    [7, 'Passivo', 'bg-yellow-500'],
    [8, 'Passivo', 'bg-yellow-500'],
    [0, 'Detrator', 'bg-red-500'],
    [6, 'Detrator', 'bg-red-500'],
  ])('score %i → label %s / color %s', (score, label, color) => {
    const result = getScoreCategory(score)
    expect(result.label).toBe(label)
    expect(result.color).toBe(color)
  })
})
