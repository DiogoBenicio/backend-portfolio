'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  siOpenjdk,
  siSpringboot,
  siNodedotjs,
  siTypescript,
  siDocker,
  siPostgresql,
  siElasticsearch,
  siNginx,
  siNextdotjs,
  siPrisma,
  siFastify,
  siLinux,
} from 'simple-icons'

function resolveColor(hex: string, dark: boolean): string {
  if (dark) return 'ffffff'
  if (hex === '000000' || hex === '111111') return '3b82f6'
  return hex
}

// Posições fixas espalhadas pela seção — fora do centro do conteúdo
const POSITIONS = [
  { icon: siOpenjdk,       top:  4, left:  2, size: 68, anim: 'f1', delay: '0s'   },
  { icon: siSpringboot,    top:  8, left: 12, size: 22, anim: 'f2', delay: '1.2s' },
  { icon: siNodedotjs,     top:  3, left: 90, size: 72, anim: 'f3', delay: '0.6s' },
  { icon: siTypescript,    top:  7, left: 82, size: 20, anim: 'd1', delay: '2s'   },
  { icon: siDocker,        top:  5, left: 46, size: 18, anim: 'd2', delay: '1.8s' },
  { icon: siElasticsearch, top:  9, left: 60, size: 64, anim: 'f1', delay: '3s'   },

  { icon: siNginx,         top: 21, left:  1, size: 60, anim: 'f2', delay: '0.4s' },
  { icon: siLinux,         top: 28, left:  3, size: 18, anim: 'd1', delay: '2.5s' },
  { icon: siPostgresql,    top: 16, left: 93, size: 20, anim: 'f3', delay: '1s'   },
  { icon: siNextdotjs,     top: 30, left: 95, size: 64, anim: 'f1', delay: '3.5s' },

  { icon: siPrisma,        top: 45, left:  2, size: 70, anim: 'f2', delay: '1.5s' },
  { icon: siFastify,       top: 55, left:  4, size: 20, anim: 'd2', delay: '0.3s' },
  { icon: siOpenjdk,       top: 48, left: 94, size: 18, anim: 'f3', delay: '4s'   },
  { icon: siDocker,        top: 60, left: 92, size: 62, anim: 'f1', delay: '0.9s' },

  { icon: siSpringboot,    top: 72, left:  1, size: 20, anim: 'd1', delay: '2.2s' },
  { icon: siNodedotjs,     top: 80, left:  3, size: 58, anim: 'f2', delay: '1.3s' },
  { icon: siTypescript,    top: 76, left: 93, size: 22, anim: 'f3', delay: '0.7s' },
  { icon: siElasticsearch, top: 85, left: 91, size: 64, anim: 'd2', delay: '3.2s' },

  { icon: siNginx,         top: 91, left:  6, size: 18, anim: 'f1', delay: '1.6s' },
  { icon: siLinux,         top: 93, left: 22, size: 68, anim: 'd1', delay: '0.5s' },
  { icon: siNextdotjs,     top: 92, left: 48, size: 20, anim: 'f2', delay: '2.8s' },
  { icon: siPostgresql,    top: 90, left: 68, size: 62, anim: 'f3', delay: '1.1s' },
  { icon: siFastify,       top: 94, left: 85, size: 18, anim: 'd2', delay: '3.8s' },
]

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
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === 'dark'

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

        <polygon points="80,10 150,50 150,130 80,170 10,130 10,50"          fill="url(#gBB)" opacity="0.17" style={{ animation: 'gf1 8s ease-in-out infinite', transformOrigin: '80px 90px' }} />
        <polygon points="1100,10 1170,50 1170,130 1100,170 1030,130 1030,50" fill="url(#gIO)" opacity="0.18" style={{ animation: 'gf2 11s ease-in-out infinite', transformOrigin: '1100px 90px' }} />
        <polygon points="60,420 110,450 110,510 60,540 10,510 10,450"        fill="url(#gBO)" opacity="0.17" style={{ animation: 'gf3 9s ease-in-out infinite 1s', transformOrigin: '60px 480px' }} />
        <polygon points="1100,380 1170,420 1170,500 1100,540 1030,500 1030,420" fill="url(#gBB)" opacity="0.16" style={{ animation: 'gf4 13s ease-in-out infinite 2s', transformOrigin: '1100px 460px' }} />
        <polygon points="550,10 600,38 600,94 550,122 500,94 500,38"         fill="url(#gIO)" opacity="0.13" style={{ animation: 'gd1 7s ease-in-out infinite 0.5s', transformOrigin: '550px 66px' }} />
        <polygon points="650,460 690,483 690,529 650,552 610,529 610,483"    fill="url(#gBB)" opacity="0.14" style={{ animation: 'gd2 10s ease-in-out infinite 3s', transformOrigin: '650px 506px' }} />
        <circle cx="30"   cy="300" r="80" fill="url(#rB)" opacity="0.18" style={{ animation: 'gf2 12s ease-in-out infinite 1s', transformOrigin: '30px 300px' }} />
        <circle cx="1170" cy="300" r="80" fill="url(#rO)" opacity="0.18" style={{ animation: 'gf1 9s ease-in-out infinite 4s', transformOrigin: '1170px 300px' }} />
        <circle cx="600"  cy="580" r="70" fill="url(#rI)" opacity="0.16" style={{ animation: 'gd1 8s ease-in-out infinite 2s', transformOrigin: '600px 580px' }} />
        <circle cx="150"  cy="30"  r="50" fill="url(#rO)" opacity="0.14" style={{ animation: 'pulse 6s ease-in-out infinite', transformOrigin: '150px 30px' }} />
        <circle cx="1050" cy="30"  r="50" fill="url(#rB)" opacity="0.14" style={{ animation: 'pulse 7s ease-in-out infinite 2s', transformOrigin: '1050px 30px' }} />
        <polygon points="0,0 120,0 0,120"          fill="url(#gBO)" opacity="0.18" style={{ animation: 'gf4 10s ease-in-out infinite 3s', transformOrigin: '40px 40px' }} />
        <polygon points="1200,0 1080,0 1200,120"    fill="url(#gBB)" opacity="0.18" style={{ animation: 'gf1 12s ease-in-out infinite 1s', transformOrigin: '1160px 40px' }} />
        <polygon points="0,600 120,600 0,480"       fill="url(#gIO)" opacity="0.17" style={{ animation: 'gd2 9s ease-in-out infinite 0.5s', transformOrigin: '40px 560px' }} />
        <polygon points="1200,600 1080,600 1200,480" fill="url(#gBO)" opacity="0.17" style={{ animation: 'gf3 8s ease-in-out infinite 2s', transformOrigin: '1160px 560px' }} />
        <polygon points="30,180 70,230 30,280 -10,230"        fill="url(#gIO)" opacity="0.15" style={{ animation: 'gf2 11s ease-in-out infinite 1.5s', transformOrigin: '30px 230px' }} />
        <polygon points="1170,180 1210,230 1170,280 1130,230" fill="url(#gBB)" opacity="0.15" style={{ animation: 'gf3 10s ease-in-out infinite 3.5s', transformOrigin: '1170px 230px' }} />
      </svg>

      {/* Camada 2 — Logos da stack em posições fixas com animação de flutuação */}
      {mounted && POSITIONS.map(({ icon, top, left, size, anim, delay }, i) => {
        const color = resolveColor(icon.hex, isDark)
        const svg = icon.svg.replace('<svg ', `<svg fill="#${color}" `)
        return (
          <span
            key={i}
            className="absolute select-none"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: size,
              height: size,
              opacity: size > 40 ? 0.15 : 0.22,
              animation: `${anim} ${8 + (i % 6) * 1.2}s ease-in-out infinite`,
              animationDelay: delay,
              display: 'inline-block',
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )
      })}
    </div>
  )
}
