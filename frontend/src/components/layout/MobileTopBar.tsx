'use client'

import { Menu, BarChart2 } from 'lucide-react'

interface Props {
  onMenuOpen: () => void
}

export function MobileTopBar({ onMenuOpen }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/40 bg-white/60 px-4 shadow-sm backdrop-blur-md md:hidden">
      <button
        onClick={onMenuOpen}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
          <BarChart2 size={14} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-900">Portfolio</span>
      </div>
    </header>
  )
}
