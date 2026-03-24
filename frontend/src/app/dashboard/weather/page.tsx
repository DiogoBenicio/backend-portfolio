'use client'

import { useState, useEffect } from 'react'
import { CitySearch } from '@/components/weather/CitySearch'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import { TemperatureChart } from '@/components/weather/TemperatureChart'
import { HumidityChart } from '@/components/weather/HumidityChart'
import { ForecastCard } from '@/components/weather/ForecastCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loadingspinner'
import { ErrorMessage } from '@/components/ui/errormessage'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { useForecast } from '@/hooks/useForecast'
import { PageContainer } from '@/components/layout/PageContainer'

export default function WeatherPage() {
  const [city, setCity] = useState('Uberlândia')

  const { data: current, isLoading: loadingCurrent, error: errorCurrent } = useCurrentWeather(city)

  const { data: forecast, isLoading: loadingForecast } = useForecast(city)

  useEffect(() => {
    if (current) {
      localStorage.setItem(
        'selectedMapCity',
        JSON.stringify({ name: current.city, lat: current.latitude, lng: current.longitude })
      )
    }
  }, [current])

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Clima</h1>
          <p className="mt-1 text-sm text-gray-500">
            Dados em tempo real via OpenWeather API · Histórico no Elasticsearch
          </p>
        </div>

        <CitySearch onSearch={setCity} defaultCity={city} />

        {loadingCurrent ? (
          <LoadingSpinner label="Buscando dados do clima..." />
        ) : errorCurrent ? (
          <ErrorMessage message="Cidade não encontrada ou erro na API. Verifique o nome e tente novamente." />
        ) : current ? (
          <>
            <CurrentWeatherCard weather={current} />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Temperatura (°C)</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingForecast ? (
                    <LoadingSpinner size={20} />
                  ) : forecast ? (
                    <TemperatureChart forecast={forecast.forecast} />
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Umidade Relativa (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  {forecast && <HumidityChart forecast={forecast.forecast} />}
                </CardContent>
              </Card>
            </div>

            {forecast && (
              <Card>
                <CardHeader>
                  <CardTitle>Previsão para os próximos dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ForecastCard forecast={forecast.forecast} />
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </PageContainer>
  )
}
