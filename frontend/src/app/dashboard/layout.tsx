'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileTopBar } from '@/components/layout/MobileTopBar'
import { DashboardTexture } from '@/components/layout/DashboardTexture'
import { SidebarContext } from '@/components/layout/SidebarContext'
import { cn } from '@/lib/utils/cn'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  const closeAll = () => {
    setMobileOpen(false)
    setCollapsed(true)
  }

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DashboardTexture />

        {/* Mobile: top bar */}
        <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />

        {/* Overlay invisível — fecha o menu ao clicar fora (apenas mobile ou sidebar expandida) */}
        {mobileOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={closeAll} />}
        {!collapsed && <div className="fixed inset-0 z-40 hidden md:block" onClick={closeAll} />}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed left-0 top-0 z-50 h-full transition-transform duration-200',
            // Mobile: slide-in drawer
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
            // Desktop: sempre visível (rail recolhida ou expandida por cima)
            'md:translate-x-0'
          )}
        >
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
            onMobileClose={closeMobile}
          />
        </div>

        {/* Main: só reserva espaço para a icon rail (w-16) no desktop */}
        <main className="relative z-10 pt-14 md:pl-16 md:pt-0 xl:pl-0">{children}</main>
      </div>
    </SidebarContext.Provider>
  )
}
