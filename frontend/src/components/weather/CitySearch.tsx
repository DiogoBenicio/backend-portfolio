'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CitySearchProps {
  onSearch: (city: string) => void
  defaultCity?: string
}

export function CitySearch({ onSearch, defaultCity = '' }: CitySearchProps) {
  const [city, setCity] = useState(defaultCity)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) onSearch(city.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Buscar cidade... (ex: Uberlândia, São Paulo)"
          className="pl-9"
        />
      </div>
      <Button type="submit">Buscar</Button>
    </form>
  )
}
