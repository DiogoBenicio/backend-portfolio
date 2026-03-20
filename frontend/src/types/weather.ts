export interface CurrentWeather {
  city: string
  country: string
  latitude: number
  longitude: number
  temperature: number
  feelsLike: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: string
  description: string
  icon: string
  uvIndex: number
  rainfall: number
  timestamp: string
}

export interface ForecastDay {
  date: string
  tempMin: number
  tempMax: number
  humidity: number
  description: string
  icon: string
  rainfall: number
}

export interface ForecastResponse {
  city: string
  country: string
  forecast: ForecastDay[]
}

export interface WeatherHistoryItem {
  id: string
  city: string
  temperature: number
  humidity: number
  timestamp: string
}

export interface WeatherHistory {
  content: WeatherHistoryItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
