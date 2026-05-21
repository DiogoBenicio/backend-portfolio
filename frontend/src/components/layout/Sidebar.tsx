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
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [{ href: '/', label: 'Home', icon: Home }]

const dashboardItems = [
  { href: '/dashboard/weather', label: 'Painel de Clima', icon: Cloud },
  { href: '/dashboard/map', label: 'Mapa de Clima', icon: Map },
  { href: '/dashboard/nps', label: 'Avaliação NPS', icon: Star },
  { href: '/dashboard/ecosystem', label: 'Observabilidade', icon: Layers },
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
        'relative flex h-dvh flex-col border-r border-gray-200 bg-white/30 shadow-lg backdrop-blur-md transition-all duration-200 dark:border-slate-700 dark:bg-gray-900/50',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Botão de colapso — centro vertical na borda direita (apenas desktop) */}
      <button
        onClick={onToggle}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute -right-3 top-1/2 z-50 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/50 text-gray-400 shadow-md backdrop-blur-sm transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:text-blue-400 md:flex"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-gray-200 py-5 dark:border-slate-700',
          collapsed ? 'px-3.5' : 'gap-3 px-5'
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <BarChart2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Portfolio</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Diogo Benício</p>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                title={collapsed ? label : undefined}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  collapsed ? 'pl-3.5' : '',
                  pathname === href
                    ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span
                  className={cn(
                    'overflow-hidden whitespace-nowrap transition-all duration-200',
                    collapsed ? 'w-0 opacity-0' : 'opacity-100 delay-150'
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <p
            className={cn(
              'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500',
              collapsed && 'invisible'
            )}
          >
            Projetos
          </p>
          <ul className="space-y-1">
            {dashboardItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    collapsed ? 'pl-3.5' : '',
                    pathname === href
                      ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  <span
                    className={cn(
                      'overflow-hidden whitespace-nowrap transition-all duration-200',
                      collapsed ? 'w-0 opacity-0' : 'opacity-100 delay-150'
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Links externos + tema */}
      <div className="border-t border-gray-200 p-2 dark:border-slate-700">
        <div
          className={cn('flex items-center gap-1', collapsed && 'flex-col')}

        >
          <a
            href="https://github.com/DiogoBenicio/backend-portfolio"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <Github size={16} className="shrink-0" />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-all duration-200',
                collapsed ? 'w-0 opacity-0' : 'opacity-100 delay-150'
              )}
            >
              GitHub
            </span>
          </a>
          <a
            href="https://linkedin.com/in/diogosbenicio"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            <Linkedin size={16} className="shrink-0" />
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-all duration-200',
                collapsed ? 'w-0 opacity-0' : 'opacity-100 delay-150'
              )}
            >
              LinkedIn
            </span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
