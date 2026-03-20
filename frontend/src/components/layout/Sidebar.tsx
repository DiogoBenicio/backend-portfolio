'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cloud, Map, Star, Home, Github, Linkedin, BarChart2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [{ href: '/', label: 'Home', icon: Home }]

const dashboardItems = [
  { href: '/dashboard/weather', label: 'Clima', icon: Cloud },
  { href: '/dashboard/map', label: 'Mapa', icon: Map },
  { href: '/dashboard/nps', label: 'NPS', icon: Star },
  { href: '/dashboard/ecosystem', label: 'Ecossistema BackEnd', icon: Layers },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <BarChart2 size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Portfolio</p>
          <p className="text-xs text-gray-500">Diogo Benício</p>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  pathname === href
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Dashboard
          </p>
          <ul className="space-y-1">
            {dashboardItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === href
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Links externos */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/diogosbenicio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Github size={16} />
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/diogosbenicio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>
      </div>
    </aside>
  )
}
