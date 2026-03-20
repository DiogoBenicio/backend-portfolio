export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`
}

export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`
}

export function formatWindSpeed(speed: number): string {
  return `${Math.round(speed)} km/h`
}

export function getUvIndexLabel(uvi: number): string {
  if (uvi <= 2) return 'Baixo'
  if (uvi <= 5) return 'Moderado'
  if (uvi <= 7) return 'Alto'
  if (uvi <= 10) return 'Muito Alto'
  return 'Extremo'
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}
