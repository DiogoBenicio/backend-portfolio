import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGet = vi.fn()
const mockPost = vi.fn()
const mockInterceptors = {
  response: { use: vi.fn() },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      interceptors: mockInterceptors,
    })),
  },
}))

const { npsApi } = await import('@/lib/api/npsClient')

describe('npsApi.submit', () => {
  beforeEach(() => mockPost.mockReset())

  it('deve fazer POST /responses com o input correto', async () => {
    const input = { score: 9, comment: 'Ótimo!', page: 'portfolio' }
    mockPost.mockResolvedValue({ data: { id: '1', ...input, createdAt: new Date().toISOString() } })

    const result = await npsApi.submit(input)

    expect(mockPost).toHaveBeenCalledWith('/responses', input)
    expect(result.score).toBe(9)
  })
})

describe('npsApi.getSummary', () => {
  beforeEach(() => mockGet.mockReset())

  it('deve fazer GET /summary com page como param', async () => {
    mockGet.mockResolvedValue({ data: { npsScore: 80, zone: 'Excelência', totalResponses: 10 } })
    const result = await npsApi.getSummary('portfolio')
    expect(mockGet).toHaveBeenCalledWith('/summary', { params: { page: 'portfolio' } })
    expect(result.zone).toBe('Excelência')
  })

  it('deve funcionar sem page (undefined)', async () => {
    mockGet.mockResolvedValue({ data: { npsScore: 0, zone: 'Crítico', totalResponses: 0 } })
    await npsApi.getSummary()
    expect(mockGet).toHaveBeenCalledWith('/summary', { params: { page: undefined } })
  })
})

describe('npsApi.listResponses', () => {
  beforeEach(() => mockGet.mockReset())

  it('deve fazer GET /responses com params de paginação', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0, limit: 5, offset: 10 } })
    await npsApi.listResponses({ page: 'portfolio', limit: 5, offset: 10 })
    expect(mockGet).toHaveBeenCalledWith('/responses', {
      params: { page: 'portfolio', limit: 5, offset: 10 },
    })
  })

  it('deve funcionar sem params', async () => {
    mockGet.mockResolvedValue({ data: { data: [], total: 0, limit: 10, offset: 0 } })
    await npsApi.listResponses()
    expect(mockGet).toHaveBeenCalledWith('/responses', { params: undefined })
  })
})
