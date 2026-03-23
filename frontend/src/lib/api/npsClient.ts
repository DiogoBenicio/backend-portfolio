import axios, { AxiosError } from 'axios'
import type { NpsSummary, NpsListResult, NpsResponseItem, SubmitNpsInput } from '@/types/nps'

const npsClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NPS_API_URL ?? 'http://localhost:3001',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

npsClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] as string | undefined
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rate-limit', { detail: { retryAfter } }))
      }
    }
    return Promise.reject(error)
  }
)

export const npsApi = {
  submit: (input: SubmitNpsInput): Promise<NpsResponseItem> =>
    npsClient.post('/responses', input).then((r) => r.data),

  getSummary: (page?: string): Promise<NpsSummary> =>
    npsClient.get('/summary', { params: { page } }).then((r) => r.data),

  listResponses: (params?: {
    page?: string
    limit?: number
    offset?: number
  }): Promise<NpsListResult> =>
    npsClient.get('/responses', { params }).then((r) => r.data),

  deleteResponse: (id: string): Promise<void> =>
    npsClient.delete(`/responses/${id}`).then(() => undefined),
}
