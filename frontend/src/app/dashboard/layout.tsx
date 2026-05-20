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

  const closeAll = () => {
    setMobileOpen(false)
    setCollapsed(true)
  }

  // Sidebar visível (overlay) quando expandida no desktop ou aberta no mobile
  const overlayVisible = mobileOpen || !collapsed

  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <DashboardTexture />

        {/* Mobile: top bar */}
        <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />

        {/* Overlay invisível — fecha o menu ao clicar fora */}
        {overlayVisible && <div className="fixed inset-0 z-40" onClick={closeAll} />}

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
            onMobileClose={closeAll}
          />
        </div>

        {/* Main: só reserva espaço para a icon rail (w-16) no desktop */}
        <main className="relative z-10 pt-14 md:pl-16 md:pt-0 xl:pl-0">{children}</main>
      </div>
    </SidebarContext.Provider>
  )
}
