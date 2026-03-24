'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Cloud,
  Map,
  Star,
  Home,
  Github,
  Linkedin,
  BarChart2,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [{ href: '/', label: 'Home', icon: Home }]

const dashboardItems = [
  { href: '/dashboard/weather', label: 'Clima', icon: Cloud },
  { href: '/dashboard/map', label: 'Mapa', icon: Map },
  { href: '/dashboard/nps', label: 'NPS', icon: Star },
  { href: '/dashboard/ecosystem', label: 'Ecossistema BackEnd', icon: Layers },
]

interface Props {
  collapsed: boolean
  onToggle: () => void
  onMobileClose: () => void
}

export function Sidebar({ collapsed, onToggle, onMobileClose }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-white/20 bg-white/30 shadow-lg backdrop-blur-md transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Botão de colapso — centro vertical na borda direita (apenas desktop) */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute -right-3 top-1/2 z-50 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/50 text-gray-400 shadow-md backdrop-blur-sm transition-colors hover:border-blue-300 hover:text-blue-600 md:flex"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-white/40 py-5',
          collapsed ? 'justify-center px-3' : 'gap-3 px-5'
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <BarChart2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-gray-900">Portfolio</p>
            <p className="text-xs text-gray-500">Diogo Benício</p>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                title={collapsed ? label : undefined}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                  collapsed ? 'justify-center' : 'gap-3',
                  pathname === href
                    ? 'bg-blue-50 font-medium text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon size={16} className="shrink-0" />
                {!collapsed && label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Dashboard
            </p>
          )}
          <ul className="space-y-1">
            {dashboardItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                    collapsed ? 'justify-center' : 'gap-3',
                    pathname === href
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  {!collapsed && label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Links externos */}
      <div className="border-t border-white/40 p-2">
        <div
          className={cn('flex', collapsed ? 'flex-col items-center gap-1' : 'items-center gap-1')}
        >
          <a
            href="https://github.com/diogosbenicio"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className={cn(
              'flex items-center rounded-lg px-2 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900',
              collapsed ? 'justify-center' : 'gap-2'
            )}
          >
            <Github size={16} />
            {!collapsed && 'GitHub'}
          </a>
          <a
            href="https://linkedin.com/in/diogosbenicio"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className={cn(
              'flex items-center rounded-lg px-2 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900',
              collapsed ? 'justify-center' : 'gap-2'
            )}
          >
            <Linkedin size={16} />
            {!collapsed && 'LinkedIn'}
          </a>
        </div>
      </div>
    </aside>
  )
}
