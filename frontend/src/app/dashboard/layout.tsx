import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar fixa — oculta em mobile */}
      <div className="hidden md:flex md:shrink-0">
        <Sidebar />
      </div>

      {/* Conteúdo principal — sem wrapper fixo; cada página define seu próprio container */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
