'use client'

import React, { useState, useEffect } from 'react'
import { CitySearch } from '@/components/weather/CitySearch'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import { TemperatureChart } from '@/components/weather/TemperatureChart'
import { HumidityChart } from '@/components/weather/HumidityChart'
import { ForecastCard } from '@/components/weather/ForecastCard'
import { SensorChart } from '@/components/weather/SensorChart'
import { DateRangePicker, type DateRange } from '@/components/weather/DateRangePicker'
import { CalendarHeatmap } from '@/components/weather/CalendarHeatmap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loadingspinner'
import { ErrorMessage } from '@/components/ui/errormessage'
import { useCurrentWeather } from '@/hooks/useCurrentWeather'
import { useForecast } from '@/hooks/useForecast'
import { useWeatherSensors } from '@/hooks/useWeatherSensors'
import { PageContainer } from '@/components/layout/PageContainer'
import { isRateLimitError } from '@/lib/errors'
import { OpenMeteoLogo } from '@/components/ui/OpenMeteoLogo'
import { OpenWeatherLogo } from '@/components/ui/OpenWeatherLogo'
import { ElasticLogo } from '@/components/ui/ElasticLogo'

function SourceBadge({ logo, label }: { logo: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/60">
      {logo}
      <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{label}</span>
    </div>
  )
}

function todayMinus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

function toISOParam(dateStr: string, end = false): string {
  return end ? `${dateStr}T23:59:59Z` : `${dateStr}T00:00:00Z`
}

export default function WeatherPage() {
  const [city, setCity] = useState('Uberlândia')

  const now = new Date()
  const [range, setRange] = useState<DateRange>({
    from: todayMinus(5),
    to: todayMinus(1),
  })
  const [appliedRange, setAppliedRange] = useState<DateRange | null>(null)

  const { data: current, isLoading: loadingCurrent, error: errorCurrent } = useCurrentWeather(city)
  const { data: forecast, isLoading: loadingForecast } = useForecast(city)
  const { data: sensorData, isLoading: loadingSensors } = useWeatherSensors(
    city,
    appliedRange ? toISOParam(appliedRange.from) : '',
    appliedRange ? toISOParam(appliedRange.to, true) : '',
  )

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Dashboard de Clima</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Dados em tempo real via OpenWeather API · Histórico por sensor no Elasticsearch
          </p>
        </div>

        <CitySearch onSearch={setCity} defaultCity={city} />

        {loadingCurrent ? (
          <LoadingSpinner label="Buscando dados do clima..." />
        ) : errorCurrent && !isRateLimitError(errorCurrent) ? (
          <ErrorMessage message="Cidade não encontrada ou erro na API. Verifique o nome e tente novamente." />
        ) : current ? (
          <>
            <CurrentWeatherCard weather={current} />

            {/* ── Gráficos de previsão ─────────────────────────── */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Temperatura (°C)</CardTitle>
                    <SourceBadge logo={<OpenWeatherLogo size={28} />} label="OpenWeather" />
                  </div>
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
                  <div className="flex items-center justify-between">
                    <CardTitle>Umidade Relativa (%)</CardTitle>
                    <SourceBadge logo={<OpenWeatherLogo size={28} />} label="OpenWeather" />
                  </div>
                </CardHeader>
                <CardContent>
                  {forecast && <HumidityChart forecast={forecast.forecast} />}
                </CardContent>
              </Card>
            </div>

            {/* ── Sensores históricos ──────────────────────────── */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <CardTitle>Sensores — histórico</CardTitle>
                    <div className="flex items-center gap-3">
                      <SourceBadge logo={<OpenMeteoLogo size={32} />} label="Open-Meteo" />
                      <SourceBadge logo={<ElasticLogo size={24} />} label="Elasticsearch" />
                    </div>
                  </div>
                  <DateRangePicker
                    value={range}
                    onChange={(r) => { setRange(r); setAppliedRange(r) }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {!appliedRange ? (
                  <p className="py-8 text-center text-sm text-gray-400 dark:text-slate-500">
                    Selecione um período e clique em Aplicar para carregar os sensores.
                  </p>
                ) : loadingSensors ? (
                  <LoadingSpinner size={20} label="Buscando dados do período..." />
                ) : (
                  <SensorChart
                    data={sensorData?.data ?? []}
                    from={appliedRange.from}
                    to={appliedRange.to}
                  />
                )}
              </CardContent>
            </Card>

            {/* ── Previsão textual ─────────────────────────────── */}
            {forecast && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Previsão para os próximos dias</CardTitle>
                    <SourceBadge logo={<OpenWeatherLogo size={28} />} label="OpenWeather" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ForecastCard forecast={forecast.forecast} />
                </CardContent>
              </Card>
            )}

            {/* ── Calendar Heatmap ─────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Disponibilidade de dados</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarHeatmap
                  city={city}
                  initialYear={now.getFullYear()}
                  initialMonth={now.getMonth() + 1}
                />
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </PageContainer>
  )
}
