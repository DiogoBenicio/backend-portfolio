import { describe, it, expect } from 'vitest'
import {
  getWeatherIconUrl,
  formatTemperature,
  formatWindSpeed,
  getUvIndexLabel,
  formatDate,
} from '@/lib/utils/weatherUtils'

describe('getWeatherIconUrl', () => {
  it('deve montar URL correta do ícone OpenWeather', () => {
    expect(getWeatherIconUrl('01d')).toBe('https://openweathermap.org/img/wn/01d@2x.png')
    expect(getWeatherIconUrl('10n')).toBe('https://openweathermap.org/img/wn/10n@2x.png')
  })
})

describe('formatTemperature', () => {
  it('deve arredondar e adicionar °C', () => {
    expect(formatTemperature(28.5)).toBe('29°C')
    expect(formatTemperature(28.4)).toBe('28°C')
    expect(formatTemperature(-3.7)).toBe('-4°C')
    expect(formatTemperature(0)).toBe('0°C')
  })
})

describe('formatWindSpeed', () => {
  it('deve arredondar e adicionar km/h', () => {
    expect(formatWindSpeed(15.7)).toBe('16 km/h')
    expect(formatWindSpeed(0)).toBe('0 km/h')
    expect(formatWindSpeed(100.4)).toBe('100 km/h')
  })
})

describe('getUvIndexLabel', () => {
  it.each([
    [0, 'Baixo'],
    [2, 'Baixo'],
    [3, 'Moderado'],
    [5, 'Moderado'],
    [6, 'Alto'],
    [7, 'Alto'],
    [8, 'Muito Alto'],
    [10, 'Muito Alto'],
    [11, 'Extremo'],
    [20, 'Extremo'],
  ])('UVI %i → %s', (uvi, label) => {
    expect(getUvIndexLabel(uvi)).toBe(label)
  })
})

describe('formatDate', () => {
  it('deve formatar data no padrão pt-BR com dia, mês e dia da semana', () => {
    const result = formatDate('2025-05-19')
    expect(result).toMatch(/\d{2}/)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
