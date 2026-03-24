'use client'

import { useMemo } from 'react'
import { Cloud, Database, Server, Code2, GitBranch, Cpu, Globe, Zap, Terminal, Layers } from 'lucide-react'

const COLOR_PATTERN = ['#3b82f6', '#2563eb', '#1d4ed8', '#4f46e5', '#6b7280'] // blue shades + gray

const ICON_TEMPLATES = [
  { Icon: Cloud,     baseSize: 130, color: '#3b82f6', delay: '0s'   },
  { Icon: Database,  baseSize: 110, color: '#4f46e5', delay: '1.5s' },
  { Icon: Zap,       baseSize: 42,  color: '#f97316', delay: '3s'   },
  { Icon: Server,    baseSize: 140, color: '#4f46e5', delay: '0.8s' },
  { Icon: Code2,     baseSize: 50,  color: '#3b82f6', delay: '2s'   },
  { Icon: GitBranch, baseSize: 40,  color: '#f97316', delay: '1s'   },
  { Icon: Cpu,       baseSize: 44,  color: '#3b82f6', delay: '2.5s' },
  { Icon: Globe,     baseSize: 38,  color: '#4f46e5', delay: '0.5s' },
  { Icon: Terminal,  baseSize: 36,  color: '#f97316', delay: '3.5s' },
  { Icon: Layers,    baseSize: 42,  color: '#3b82f6', delay: '1.8s' },
  { Icon: Code2,     baseSize: 50,  color: '#4f46e5', delay: '0.3s' },
  { Icon: Zap,       baseSize: 38,  color: '#f97316', delay: '2.2s' },
  { Icon: Cloud,     baseSize: 64,  color: '#60a5fa', delay: '1.2s' },
  { Icon: Server,    baseSize: 58,  color: '#818cf8', delay: '0.7s' },
  { Icon: GitBranch, baseSize: 42,  color: '#f97316', delay: '1.1s' },
  { Icon: Globe,     baseSize: 44,  color: '#4f46e5', delay: '0.9s' },
  { Icon: Layers,    baseSize: 120, color: '#3b82f6', delay: '0.8s' },
]

const CSS = `
  @keyframes dt1 {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    40%      { transform: translate(8px,-10px) rotate(5deg); }
    70%      { transform: translate(-5px,7px) rotate(-3deg); }
  }
  @keyframes dt2 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-10px,8px); }
  }
  @keyframes dt3 {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    50%      { transform: translate(6px,-12px) rotate(8deg); }
  }
  @keyframes dtpulse {
    0%,100% { opacity: 0.07; }
    50%      { opacity: 0.13; }
  }
`

const ANIMS = ['dt1', 'dt2', 'dt3']

export function DashboardTexture() {
  const icons = useMemo(() => {
    return ICON_TEMPLATES.map((template, index) => ({
      ...template,
      top: Math.random() * 88 + 6,    // 6% a 94%
      left: Math.random() * 88 + 6,   // 6% a 94%
      size: Math.round(template.baseSize * (0.8 + Math.random() * 0.6)),
      color: COLOR_PATTERN[index % COLOR_PATTERN.length],
    }))
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <style>{CSS}</style>

      {/* Camada 1 — Formas geométricas SVG com degradê */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="dtBB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="dtBO" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="dtIO" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <radialGradient id="dtRB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dtRI" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="1" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dtRO" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hexágonos — cantos */}
        <polygon
          points="80,10 150,50 150,130 80,170 10,130 10,50"
          fill="url(#dtBB)" opacity="0.12"
          style={{ animation: 'dt1 9s ease-in-out infinite', transformOrigin: '80px 90px' }}
        />
        <polygon
          points="1100,10 1170,50 1170,130 1100,170 1030,130 1030,50"
          fill="url(#dtIO)" opacity="0.12"
          style={{ animation: 'dt2 12s ease-in-out infinite', transformOrigin: '1100px 90px' }}
        />
        <polygon
          points="60,620 110,650 110,710 60,740 10,710 10,650"
          fill="url(#dtBO)" opacity="0.11"
          style={{ animation: 'dt3 10s ease-in-out infinite 1s', transformOrigin: '60px 680px' }}
        />
        <polygon
          points="1100,580 1170,620 1170,700 1100,740 1030,700 1030,620"
          fill="url(#dtBB)" opacity="0.11"
          style={{ animation: 'dt1 13s ease-in-out infinite 2s', transformOrigin: '1100px 660px' }}
        />

        {/* Triângulos — cantos */}
        <polygon
          points="0,0 140,0 0,140"
          fill="url(#dtBO)" opacity="0.10"
          style={{ animation: 'dt2 10s ease-in-out infinite 3s', transformOrigin: '46px 46px' }}
        />
        <polygon
          points="1200,0 1060,0 1200,140"
          fill="url(#dtBB)" opacity="0.10"
          style={{ animation: 'dt1 12s ease-in-out infinite 1s', transformOrigin: '1153px 46px' }}
        />
        <polygon
          points="0,800 140,800 0,660"
          fill="url(#dtIO)" opacity="0.10"
          style={{ animation: 'dt3 9s ease-in-out infinite 0.5s', transformOrigin: '46px 753px' }}
        />
        <polygon
          points="1200,800 1060,800 1200,660"
          fill="url(#dtBO)" opacity="0.10"
          style={{ animation: 'dt2 8s ease-in-out infinite 2s', transformOrigin: '1153px 753px' }}
        />

        {/* Círculos radiais — bordas */}
        <circle cx="20"   cy="400" r="90" fill="url(#dtRB)" opacity="0.12"
          style={{ animation: 'dtpulse 8s ease-in-out infinite' }} />
        <circle cx="1180" cy="400" r="90" fill="url(#dtRO)" opacity="0.12"
          style={{ animation: 'dtpulse 10s ease-in-out infinite 2s' }} />
        <circle cx="600"  cy="780" r="70" fill="url(#dtRI)" opacity="0.10"
          style={{ animation: 'dtpulse 7s ease-in-out infinite 1s' }} />
        <circle cx="200"  cy="20"  r="50" fill="url(#dtRO)" opacity="0.09"
          style={{ animation: 'dtpulse 9s ease-in-out infinite 3s' }} />
        <circle cx="1000" cy="20"  r="50" fill="url(#dtRB)" opacity="0.09"
          style={{ animation: 'dtpulse 11s ease-in-out infinite 0.5s' }} />

        {/* Cobrindo mais área: forma central e retângulos suaves */}
        <polygon
          points="300,240 900,240 1080,520 600,760 120,520"
          fill="url(#dtIO)" opacity="0.045"
          style={{ animation: 'dt2 14s ease-in-out infinite', transformOrigin: '600px 500px' }}
        />
        <rect x="0" y="0" width="1200" height="800" fill="url(#dtRB)" opacity="0.03" />
        <rect x="0" y="350" width="1200" height="120" fill="url(#dtRO)" opacity="0.04" />

        {/* Losangos — bordas laterais */}
        <polygon
          points="20,220 65,270 20,320 -25,270"
          fill="url(#dtIO)" opacity="0.10"
          style={{ animation: 'dt2 11s ease-in-out infinite 1.5s', transformOrigin: '20px 270px' }}
        />
        <polygon
          points="1180,220 1225,270 1180,320 1135,270"
          fill="url(#dtBB)" opacity="0.10"
          style={{ animation: 'dt3 10s ease-in-out infinite 3.5s', transformOrigin: '1180px 270px' }}
        />
      </svg>

      {/* Camada 2 — Ícones animados */}
      {icons.map(({ Icon, top, left, size, color, delay }, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            color,
            opacity: 0.08,
            animation: `${ANIMS[i % 3]} ${9 + (i % 4) * 1.5}s ease-in-out infinite`,
            animationDelay: delay,
          }}
        >
          <Icon size={size} />
        </div>
      ))}
    </div>
  )
}
