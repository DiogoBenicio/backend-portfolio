import axios, { AxiosError } from 'axios'
import type {
  CurrentWeather,
  ForecastResponse,
  WeatherHistory,
  SensorDataResponse,
  CalendarResponse,
} from '@/types/weather'
import { RateLimitError } from '@/lib/errors'

const weatherClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WEATHER_API_URL ?? 'http://localhost:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

function isRateLimitAxiosError(error: AxiosError): boolean {
  if (error.response?.status === 429) return true
  // Gateway pode retornar 500 com mensagem de rate limit antes do fix ser deployado
  if (error.response?.status === 500) {
    const data = error.response.data as { message?: string } | undefined
    return typeof data?.message === 'string' && data.message.includes('Muitas requisições')
  }
  return false
}

weatherClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (isRateLimitAxiosError(error)) {
      const retryAfter = error.response?.headers['retry-after'] as string | undefined
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('rate-limit', { detail: { retryAfter } }))
      }
      return Promise.reject(new RateLimitError())
    }
    return Promise.reject(error)
  }
)

export const weatherApi = {
  getCurrent: (city: string, country?: string): Promise<CurrentWeather> =>
    weatherClient.get('/current', { params: { city, country } }).then((r) => r.data),

  getForecast: (city: string, days = 5): Promise<ForecastResponse> =>
    weatherClient.get('/forecast', { params: { city, days } }).then((r) => r.data),

  getHistory: (
    city: string,
    from?: string,
    to?: string,
    page = 0,
    size = 20
  ): Promise<WeatherHistory> =>
    weatherClient.get('/history', { params: { city, from, to, page, size } }).then((r) => r.data),

  getCities: (): Promise<string[]> => weatherClient.get('/cities').then((r) => r.data),

  getSensors: (city: string, from: string, to: string): Promise<SensorDataResponse> =>
    weatherClient.get('/sensors', { params: { city, from, to } }).then((r) => r.data),

  getCalendar: (city: string, year: number, month: number): Promise<CalendarResponse> =>
    weatherClient.get('/calendar', { params: { city, year, month } }).then((r) => r.data),

  populate: (city: string, date: string): Promise<CurrentWeather> =>
    weatherClient.post('/populate', null, { params: { city, date } }).then((r) => r.data),
}
