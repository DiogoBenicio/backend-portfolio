import { describe, it, expect } from 'vitest'
import { RateLimitError, isRateLimitError } from '@/lib/errors'

describe('RateLimitError', () => {
  it('deve ter status 429', () => {
    expect(new RateLimitError().status).toBe(429)
  })

  it('deve ter name RateLimitError', () => {
    expect(new RateLimitError().name).toBe('RateLimitError')
  })

  it('deve ser instância de Error', () => {
    expect(new RateLimitError()).toBeInstanceOf(Error)
  })

  it('deve ter mensagem correta', () => {
    expect(new RateLimitError().message).toBe('Rate limit exceeded')
  })
})

describe('isRateLimitError', () => {
  it('deve retornar true para RateLimitError', () => {
    expect(isRateLimitError(new RateLimitError())).toBe(true)
  })

  it('deve retornar false para Error genérico', () => {
    expect(isRateLimitError(new Error('outro'))).toBe(false)
  })

  it('deve retornar false para string', () => {
    expect(isRateLimitError('erro')).toBe(false)
  })

  it('deve retornar false para null', () => {
    expect(isRateLimitError(null)).toBe(false)
  })

  it('deve retornar false para objeto simples', () => {
    expect(isRateLimitError({ status: 429 })).toBe(false)
  })
})
