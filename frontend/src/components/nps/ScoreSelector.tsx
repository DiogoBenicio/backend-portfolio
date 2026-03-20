'use client'

import { cn } from '@/lib/utils/cn'

interface ScoreSelectorProps {
  value: number | null
  onChange: (score: number) => void
}

function getScoreStyle(score: number, selected: number | null) {
  const isSelected = score === selected
  if (score <= 6)
    return cn(
      'border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
      isSelected && 'bg-red-500 text-white border-red-500'
    )
  if (score <= 8)
    return cn(
      'border-yellow-200 bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
      isSelected && 'bg-yellow-500 text-white border-yellow-500'
    )
  return cn(
    'border-green-200 bg-green-50 text-green-600 hover:bg-green-100',
    isSelected && 'bg-green-500 text-white border-green-500'
  )
}

export function ScoreSelector({ value, onChange }: ScoreSelectorProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'h-10 w-10 rounded-lg border text-sm font-medium transition-all',
              getScoreStyle(i, value)
            )}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>Nada provável</span>
        <span>Extremamente provável</span>
      </div>
    </div>
  )
}
