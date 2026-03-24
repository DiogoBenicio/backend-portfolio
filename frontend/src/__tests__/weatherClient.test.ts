import { describe, it, expect, vi, beforeEach } from 'vitest'

// Captura chamadas feitas pela instância interna do weatherClient
const mockGet = vi.fn()
const mockInterceptors = {
  response: { use: vi.fn() },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: vi.fn(),
      interceptors: mockInterceptors,
    })),
  },
}))

const { weatherApi } = await import('@/lib/api/weatherClient')

describe('weatherApi.getCurrent', () => {
  beforeEach(() => mockGet.mockReset())

  it('deve chamar GET /current com params city e country', async () => {
    mockGet.mockResolvedValue({ data: { city: 'Fortaleza', temperature: 30 } })
    const result = await weatherApi.getCurrent('Fortaleza', 'BR')
    expect(mockGet).toHaveBeenCalledWith('/current', {
      params: { city: 'Fortaleza', country: 'BR' },
    })
    expect(result).toEqual({ city: 'Fortaleza', temperature: 30 })
  })

  it('deve chamar GET /current sem country quando omitido', async () => {
    mockGet.mockResolvedValue({ data: { city: 'Recife' } })
    await weatherApi.getCurrent('Recife')
    expect(mockGet).toHaveBeenCalledWith('/current', {
      params: { city: 'Recife', country: undefined },
    })
  })
})

describe('weatherApi.getForecast', () => {
  beforeEach(() => mockGet.mockReset())

  it('deve chamar GET /forecast com city e days', async () => {
    mockGet.mockResolvedValue({ data: { city: 'SP', forecast: [] } })
    await weatherApi.getForecast('SP', 3)
    expect(mockGet).toHaveBeenCalledWith('/forecast', { params: { city: 'SP', days: 3 } })
  })

  it('deve usar days=5 como default', async () => {
    mockGet.mockResolvedValue({ data: { city: 'SP', forecast: [] } })
    await weatherApi.getForecast('SP')
    expect(mockGet).toHaveBeenCalledWith('/forecast', { params: { city: 'SP', days: 5 } })
  })
})

describe('weatherApi.getHistory', () => {
  beforeEach(() => mockGet.mockReset())

  it('deve chamar GET /history com todos os params', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } })
    await weatherApi.getHistory('Brasília', '2024-01-01', '2024-01-31', 1, 10)
    expect(mockGet).toHaveBeenCalledWith('/history', {
      params: { city: 'Brasília', from: '2024-01-01', to: '2024-01-31', page: 1, size: 10 },
    })
  })

  it('deve usar page=0 e size=20 como defaults', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0 } })
    await weatherApi.getHistory('Belém')
    expect(mockGet).toHaveBeenCalledWith('/history', {
      params: { city: 'Belém', from: undefined, to: undefined, page: 0, size: 20 },
    })
  })
})

describe('weatherApi.getCities', () => {
  beforeEach(() => mockGet.mockReset())

  it('deve chamar GET /cities e retornar array', async () => {
    mockGet.mockResolvedValue({ data: ['São Paulo', 'Rio de Janeiro'] })
    const result = await weatherApi.getCities()
    expect(mockGet).toHaveBeenCalledWith('/cities')
    expect(result).toEqual(['São Paulo', 'Rio de Janeiro'])
  })
})
