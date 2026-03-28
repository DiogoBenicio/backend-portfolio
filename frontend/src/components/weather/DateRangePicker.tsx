'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

const MAX_DAYS = 7

export interface DateRange {
  from: string // ISO date string YYYY-MM-DD
  to: string
}

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

function toLocalDateString(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function DateRangePicker({ value, onChange }: Props) {
  const [from, setFrom] = useState(value.from)
  const [to, setTo] = useState(value.to)

  const yesterday  = toLocalDateString(new Date(Date.now() - 1 * 86_400_000))
  const minDate    = toLocalDateString(new Date(Date.now() - 5 * 86_400_000))
  const maxDate    = yesterday

  const diffDays =
    from && to
      ? Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000)
      : 0

  const invalid = diffDays > MAX_DAYS || diffDays < 0

  function handleApply() {
    if (!invalid && from && to) {
      onChange({ from, to })
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Data inicial</label>
        <Input
          type="date"
          value={from}
          min={minDate}
          max={maxDate}
          onChange={(e) => setFrom(e.target.value)}
          className="w-40 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 dark:text-slate-400">Data final</label>
        <Input
          type="date"
          value={to}
          min={from || minDate}
          max={maxDate}
          onChange={(e) => setTo(e.target.value)}
          className="w-40 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className={cn('text-xs', invalid ? 'text-red-500' : 'text-transparent select-none')}>
          {invalid
            ? diffDays < 0
              ? 'Data inicial após final'
              : `Máx. ${MAX_DAYS} dias`
            : '·'}
        </span>
        <Button onClick={handleApply} disabled={invalid || !from || !to} size="sm">
          Aplicar
        </Button>
      </div>
    </div>
  )
}
