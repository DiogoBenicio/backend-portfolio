'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface GeoResult {
  name: string
  state?: string
  country: string
  lat: number
  lon: number
}

interface CitySearchProps {
  onSearch: (city: string, country?: string) => void
  onSelectFull?: (result: {
    name: string
    country: string
    lat: number
    lon: number
    state?: string
  }) => void
  defaultCity?: string
}

export function CitySearch({ onSearch, onSelectFull, defaultCity = '' }: CitySearchProps) {
  const [query, setQuery] = useState(defaultCity ?? '')
  const [suggestions, setSuggestions] = useState<GeoResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY ?? ''

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Busca com debounce de 350ms
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      if (!apiKey) return
      setLoading(true)
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${apiKey}`,
          { signal: controller.signal }
        )
        const data: GeoResult[] = await res.json()
        // Deduplicar: manter apenas o primeiro resultado por nome normalizado+país
        const normalize = (s: string) =>
          s
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
        const seen = new Set<string>()
        const unique = data.filter((r) => {
          const key = `${normalize(r.name)}-${r.country}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        setSuggestions(unique)
        setOpen(focused && unique.length > 0)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, apiKey, focused])

  function handleSelect(result: GeoResult) {
    setQuery('')
    setOpen(false)
    setSuggestions([])
    onSearch(result.name, result.country)
    if (onSelectFull) {
      onSelectFull({
        name: result.name,
        country: result.country,
        lat: result.lat,
        lon: result.lon,
        state: result.state,
      })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !open) {
      e.preventDefault()
      if (query.trim()) onSearch(query.trim(), undefined)
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        </div>
      )}
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setFocused(true)
          if (suggestions.length > 0) setOpen(true)
        }}
        onBlur={() => setFocused(false)}
        placeholder="Buscar cidade... (ex: Uberlândia, São Paulo)"
        className="pl-9 pr-9"
        autoComplete="off"
      />

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
          {suggestions.map((r) => (
            <li key={`${r.name}-${r.country}-${r.lat}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(r)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <MapPin size={13} className="shrink-0 text-blue-400" />
                <span className="font-medium text-gray-800 dark:text-slate-200">{r.name}</span>
                {r.state && <span className="text-gray-400 dark:text-slate-500">{r.state}</span>}
                <span className="ml-auto text-xs font-semibold text-gray-400 dark:text-slate-500">
                  {r.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
