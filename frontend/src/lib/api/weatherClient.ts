import axios, { AxiosError } from 'axios'
import type { CurrentWeather, ForecastResponse, WeatherHistory } from '@/types/weather'

const weatherClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_WEATHER_API_URL ?? 'http://localhost:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

weatherClient.interceptors.response.use(
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

export const weatherApi = {
  getCurrent: (city: string, country?: string): Promise<CurrentWeather> =>
    weatherClient.get('/api/v1/weather/current', { params: { city, country } }).then((r) => r.data),

  getForecast: (city: string, days = 5): Promise<ForecastResponse> =>
    weatherClient.get('/api/v1/weather/forecast', { params: { city, days } }).then((r) => r.data),

  getHistory: (
    city: string,
    from?: string,
    to?: string,
    page = 0,
    size = 20
  ): Promise<WeatherHistory> =>
    weatherClient
      .get('/api/v1/weather/history', { params: { city, from, to, page, size } })
      .then((r) => r.data),

  getCities: (): Promise<string[]> =>
    weatherClient.get('/api/v1/weather/cities').then((r) => r.data),
}
