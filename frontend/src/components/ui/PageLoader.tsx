'use client'

import { BarChart2 } from 'lucide-react'

interface PageLoaderProps {
  label?: string
}

const BARS = [
  { delay: '0s', peak: '28px' },
  { delay: '0.12s', peak: '40px' },
  { delay: '0.24s', peak: '20px' },
  { delay: '0.08s', peak: '48px' }, // barra central — orange accent
  { delay: '0.20s', peak: '24px' },
  { delay: '0.16s', peak: '36px' },
  { delay: '0.04s', peak: '16px' },
]

export function PageLoader({ label = 'Carregando...' }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-gray-950/70">
      <div className="flex flex-col items-center justify-center gap-8 select-none rounded-2xl border border-gray-200 bg-white px-16 py-12 shadow-xl dark:border-slate-700 dark:bg-gray-900">
        <style>{`
        @keyframes equalize {
          0%   { height: 4px;  opacity: 0.5; }
          30%  { height: var(--peak); opacity: 1; }
          60%  { height: 8px;  opacity: 0.6; }
          80%  { height: var(--peak); opacity: 0.9; }
          100% { height: 4px;  opacity: 0.5; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50%       { opacity: 1;   transform: translateY(-3px); }
        }
      `}</style>

        {/* Ícone do portfólio */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/25">
          <BarChart2 size={26} className="text-white" />
        </div>

        {/* Barras equalizadoras */}
        <div className="flex items-end gap-[5px]" style={{ height: '52px' }}>
          {BARS.map((bar, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-full ${i === 3 ? 'bg-orange-500' : 'bg-blue-500'}`}
              style={
                {
                  '--peak': bar.peak,
                  animation: `equalize 1.4s ease-in-out ${bar.delay} infinite`,
                  height: '4px',
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Label com três pontos animados */}
        <div className="flex items-center gap-1 text-sm text-gray-400 dark:text-slate-500">
          <span>{label}</span>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                display: 'inline-block',
              }}
            >
              .
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
