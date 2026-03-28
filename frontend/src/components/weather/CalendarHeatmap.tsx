'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useWeatherCalendar } from '@/hooks/useWeatherCalendar'
import { weatherApi } from '@/lib/api/weatherClient'
import { ElasticLogo } from '@/components/ui/ElasticLogo'
import { cn } from '@/lib/utils/cn'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

interface Props {
  city: string
  initialYear: number
  initialMonth: number // 1-12
}

export function CalendarHeatmap({ city, initialYear, initialMonth }: Props) {
  const now = new Date()
  const [year, setYear]   = useState(initialYear)
  const [month, setMonth] = useState(initialMonth) // 1-12

  const { data, isLoading, refetch } = useWeatherCalendar(city, year, month)
  const queryClient = useQueryClient()

  const { mutate: populate, isPending: populating } = useMutation({
    mutationFn: (date: string) => weatherApi.populate(city, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weather', 'calendar', city, year, month] })
      refetch()
    },
  })

  const daysWithData = new Set(data?.daysWithData ?? [])

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const todayStr = new Date().toISOString().split('T')[0]

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    // Don't allow future months
    const target = new Date(y, m - 1, 1)
    if (target > new Date(now.getFullYear(), now.getMonth(), 1)) return
    setYear(y)
    setMonth(m)
  }

  function dateString(day: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function isFuture(day: number) {
    return dateString(day) > todayStr
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ElasticLogo size={28} />
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
            Dados no Elasticsearch
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            ‹
          </button>
          <span className="min-w-[130px] text-center text-sm font-medium text-gray-700 dark:text-slate-200">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            onClick={() => navigate(1)}
            className={cn(
              'rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800',
              month === now.getMonth() + 1 && year === now.getFullYear()
                ? 'cursor-not-allowed opacity-30'
                : '',
            )}
          >
            ›
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-blue-500/80" />
          Com dados
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-gray-200 dark:bg-slate-700" />
          Sem dados (clique para buscar)
        </span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[280px]">
            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1 text-center text-xs font-medium text-gray-400 dark:text-slate-500">
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${i}`} />
                }

                const ds = dateString(day)
                const hasData = daysWithData.has(ds)
                const future  = isFuture(day)

                return (
                  <button
                    key={ds}
                    disabled={future || populating}
                    onClick={() => !hasData && !future && populate(ds)}
                    title={
                      future    ? 'Data futura'
                      : hasData ? `Dados disponíveis — ${ds}`
                                : `Clique para buscar dados de ${ds}`
                    }
                    className={cn(
                      'relative flex h-9 w-full items-center justify-center rounded-md text-xs font-medium transition-all',
                      hasData
                        ? 'bg-blue-500/80 text-white hover:bg-blue-500'
                        : future
                        ? 'cursor-default bg-gray-100 text-gray-300 dark:bg-slate-800/50 dark:text-slate-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700',
                    )}
                  >
                    {day}
                    {hasData && (
                      <span className="absolute bottom-0.5 right-0.5">
                        <ElasticLogo size={8} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
