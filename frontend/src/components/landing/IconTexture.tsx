'use client'

import {
  Cloud,
  Wind,
  Thermometer,
  MapPin,
  Droplets,
  Sun,
  Database,
  Server,
  Code2,
  Layers,
  GitBranch,
  Cpu,
  Globe,
  Lock,
  Zap,
  Terminal,
} from 'lucide-react'

// Paleta: Azul #3b82f6 · Índigo #4f46e5 · Laranja #f97316
// Zona de exclusão: left 10%–88%, top 12%–88% (protege o conteúdo central)
function outside(top: number, left: number) {
  return top < 20 || top > 75 || left < 15 || left > 78
}

const ICONS = [
  // Cantos e bordas — fora da zona de exclusão
  { Icon: Cloud, top: 4, left: 2, size: 68, color: '#3b82f6', anim: 'f1', delay: '0s' },
  { Icon: Database, top: 7, left: 14, size: 20, color: '#4f46e5', anim: 'f2', delay: '1.2s' },
  { Icon: Zap, top: 3, left: 92, size: 72, color: '#f97316', anim: 'f3', delay: '0.6s' },
  { Icon: Server, top: 8, left: 91, size: 18, color: '#3b82f6', anim: 'd1', delay: '2s' },
  { Icon: Wind, top: 5, left: 48, size: 16, color: '#4f46e5', anim: 'd2', delay: '1.8s' },
  { Icon: Sun, top: 9, left: 62, size: 64, color: '#f97316', anim: 'f1', delay: '3s' },

  { Icon: Code2, top: 20, left: 1, size: 62, color: '#4f46e5', anim: 'f2', delay: '0.4s' },
  { Icon: GitBranch, top: 28, left: 3, size: 17, color: '#f97316', anim: 'd1', delay: '2.5s' },
  { Icon: Globe, top: 16, left: 93, size: 18, color: '#3b82f6', anim: 'f3', delay: '1s' },
  { Icon: Lock, top: 30, left: 95, size: 66, color: '#f97316', anim: 'f1', delay: '3.5s' },

  { Icon: Cpu, top: 45, left: 2, size: 70, color: '#3b82f6', anim: 'f2', delay: '1.5s' },
  { Icon: MapPin, top: 55, left: 4, size: 19, color: '#4f46e5', anim: 'd2', delay: '0.3s' },
  { Icon: Terminal, top: 48, left: 94, size: 16, color: '#4f46e5', anim: 'f3', delay: '4s' },
  { Icon: Droplets, top: 60, left: 92, size: 64, color: '#3b82f6', anim: 'f1', delay: '0.9s' },

  { Icon: Layers, top: 72, left: 1, size: 18, color: '#f97316', anim: 'd1', delay: '2.2s' },
  { Icon: Cloud, top: 80, left: 3, size: 60, color: '#4f46e5', anim: 'f2', delay: '1.3s' },
  { Icon: Thermometer, top: 75, left: 93, size: 20, color: '#3b82f6', anim: 'f3', delay: '0.7s' },
  { Icon: Sun, top: 85, left: 91, size: 66, color: '#f97316', anim: 'd2', delay: '3.2s' },

  { Icon: GitBranch, top: 91, left: 6, size: 17, color: '#3b82f6', anim: 'f1', delay: '1.6s' },
  { Icon: Database, top: 93, left: 22, size: 70, color: '#4f46e5', anim: 'd1', delay: '0.5s' },
  { Icon: Zap, top: 92, left: 48, size: 18, color: '#f97316', anim: 'f2', delay: '2.8s' },
  { Icon: Code2, top: 90, left: 68, size: 64, color: '#3b82f6', anim: 'f3', delay: '1.1s' },
  { Icon: Cpu, top: 94, left: 85, size: 16, color: '#4f46e5', anim: 'd2', delay: '3.8s' },
].filter(({ top, left }) => outside(top, left))

const CSS = `
  @keyframes f1 {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    33%      { transform: translate(10px,-14px) rotate(6deg); }
    66%      { transform: translate(-7px,9px) rotate(-4deg); }
  }
  @keyframes f2 {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    40%      { transform: translate(-12px,-10px) rotate(-8deg); }
    70%      { transform: translate(9px,13px) rotate(5deg); }
  }
  @keyframes f3 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(7px,-16px) scale(1.08); }
  }
  @keyframes d1 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(16px,-8px); }
  }
  @keyframes d2 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-14px,11px); }
  }
  @keyframes gf1 {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    33%      { transform: translate(12px,-18px) rotate(8deg); }
    66%      { transform: translate(-8px,10px) rotate(-5deg); }
  }
  @keyframes gf2 {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    40%      { transform: translate(-15px,-12px) rotate(-10deg); }
    70%      { transform: translate(10px,16px) rotate(6deg); }
  }
  @keyframes gf3 {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(8px,-20px) scale(1.08); }
  }
  @keyframes gf4 {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    25%      { transform: translate(-10px,14px) rotate(15deg); }
    75%      { transform: translate(14px,-8px) rotate(-12deg); }
  }
  @keyframes gd1 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(20px,-10px); }
  }
  @keyframes gd2 {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(-18px,14px); }
  }
  @keyframes pulse {
    0%,100% { opacity: 0.16; }
    50%      { opacity: 0.26; }
  }
`

export function IconTexture() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <style>{CSS}</style>

      {/* Camada 1 — Formas geométricas SVG */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1200 600"
      >
        <defs>
          <linearGradient id="gBB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="gBO" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="gIO" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <radialGradient id="rB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rI" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="1" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rO" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hexágonos — cantos */}
        <polygon
          points="80,10 150,50 150,130 80,170 10,130 10,50"
          fill="url(#gBB)"
          opacity="0.17"
          style={{ animation: 'gf1 8s ease-in-out infinite', transformOrigin: '80px 90px' }}
        />
        <polygon
          points="1100,10 1170,50 1170,130 1100,170 1030,130 1030,50"
          fill="url(#gIO)"
          opacity="0.18"
          style={{ animation: 'gf2 11s ease-in-out infinite', transformOrigin: '1100px 90px' }}
        />
        <polygon
          points="60,420 110,450 110,510 60,540 10,510 10,450"
          fill="url(#gBO)"
          opacity="0.17"
          style={{ animation: 'gf3 9s ease-in-out infinite 1s', transformOrigin: '60px 480px' }}
        />
        <polygon
          points="1100,380 1170,420 1170,500 1100,540 1030,500 1030,420"
          fill="url(#gBB)"
          opacity="0.16"
          style={{ animation: 'gf4 13s ease-in-out infinite 2s', transformOrigin: '1100px 460px' }}
        />

        {/* Hexágonos — topo/fundo centro */}
        <polygon
          points="550,10 600,38 600,94 550,122 500,94 500,38"
          fill="url(#gIO)"
          opacity="0.13"
          style={{ animation: 'gd1 7s ease-in-out infinite 0.5s', transformOrigin: '550px 66px' }}
        />
        <polygon
          points="650,460 690,483 690,529 650,552 610,529 610,483"
          fill="url(#gBB)"
          opacity="0.14"
          style={{ animation: 'gd2 10s ease-in-out infinite 3s', transformOrigin: '650px 506px' }}
        />

        {/* Círculos radiais — bordas */}
        <circle
          cx="30"
          cy="300"
          r="80"
          fill="url(#rB)"
          opacity="0.18"
          style={{ animation: 'gf2 12s ease-in-out infinite 1s', transformOrigin: '30px 300px' }}
        />
        <circle
          cx="1170"
          cy="300"
          r="80"
          fill="url(#rO)"
          opacity="0.18"
          style={{ animation: 'gf1 9s ease-in-out infinite 4s', transformOrigin: '1170px 300px' }}
        />
        <circle
          cx="600"
          cy="580"
          r="70"
          fill="url(#rI)"
          opacity="0.16"
          style={{ animation: 'gd1 8s ease-in-out infinite 2s', transformOrigin: '600px 580px' }}
        />
        <circle
          cx="150"
          cy="30"
          r="50"
          fill="url(#rO)"
          opacity="0.14"
          style={{ animation: 'pulse 6s ease-in-out infinite', transformOrigin: '150px 30px' }}
        />
        <circle
          cx="1050"
          cy="30"
          r="50"
          fill="url(#rB)"
          opacity="0.14"
          style={{ animation: 'pulse 7s ease-in-out infinite 2s', transformOrigin: '1050px 30px' }}
        />

        {/* Triângulos — cantos */}
        <polygon
          points="0,0 120,0 0,120"
          fill="url(#gBO)"
          opacity="0.18"
          style={{ animation: 'gf4 10s ease-in-out infinite 3s', transformOrigin: '40px 40px' }}
        />
        <polygon
          points="1200,0 1080,0 1200,120"
          fill="url(#gBB)"
          opacity="0.18"
          style={{ animation: 'gf1 12s ease-in-out infinite 1s', transformOrigin: '1160px 40px' }}
        />
        <polygon
          points="0,600 120,600 0,480"
          fill="url(#gIO)"
          opacity="0.17"
          style={{ animation: 'gd2 9s ease-in-out infinite 0.5s', transformOrigin: '40px 560px' }}
        />
        <polygon
          points="1200,600 1080,600 1200,480"
          fill="url(#gBO)"
          opacity="0.17"
          style={{ animation: 'gf3 8s ease-in-out infinite 2s', transformOrigin: '1160px 560px' }}
        />

        {/* Losangos — bordas laterais */}
        <polygon
          points="30,180 70,230 30,280 -10,230"
          fill="url(#gIO)"
          opacity="0.15"
          style={{ animation: 'gf2 11s ease-in-out infinite 1.5s', transformOrigin: '30px 230px' }}
        />
        <polygon
          points="1170,180 1210,230 1170,280 1130,230"
          fill="url(#gBB)"
          opacity="0.15"
          style={{
            animation: 'gf3 10s ease-in-out infinite 3.5s',
            transformOrigin: '1170px 230px',
          }}
        />
      </svg>

      {/* Camada 2 — Ícones animados (fora da zona de exclusão) */}
      <div className="absolute inset-0">
        {ICONS.map(({ Icon, top, left, size, color, anim, delay }, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              color,
              opacity: size > 40 ? 0.16 : 0.22,
              animation: `${anim} ${8 + (i % 6) * 1.2}s ease-in-out infinite`,
              animationDelay: delay,
            }}
          >
            <Icon size={size} />
          </div>
        ))}
      </div>
    </div>
  )
}
