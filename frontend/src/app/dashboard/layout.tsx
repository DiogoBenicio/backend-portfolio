'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { DashboardTexture } from '@/components/layout/DashboardTexture'
import { cn } from '@/lib/utils/cn'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Textura de fundo — fixed cobre o viewport inteiro, atrás de tudo */}
      <DashboardTexture />

      {/* Mobile: top bar */}
      <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />

      {/* Mobile: overlay escuro */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full transition-transform duration-200 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/*
        Mobile       : sem padding lateral (full width)
        md–lg (tablet): só padding-left da sidebar — conteúdo usa o espaço todo à direita
        xl+           : padding-left + padding-right espelhado → mx-auto centraliza no viewport
      */}
      <main
        className={cn(
          'relative z-10 pt-14 transition-all duration-200 md:pt-0',
          collapsed ? 'md:pl-16 xl:pr-16' : 'md:pl-60 xl:pr-60'
        )}
      >
        {children}
      </main>
    </div>
  )
}
