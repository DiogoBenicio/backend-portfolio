export class RateLimitError extends Error {
  readonly status = 429
  constructor() {
    super('Rate limit exceeded')
    this.name = 'RateLimitError'
  }
}

export const isRateLimitError = (e: unknown): e is RateLimitError =>
  e instanceof RateLimitError
