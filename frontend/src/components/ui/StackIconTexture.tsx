'use client'

/**
 * Camada de logos da stack animados (trafegam da esquerda para direita).
 * Usada tanto na landing (IconTexture) quanto no dashboard (DashboardTexture).
 */

import { useEffect, useRef, useState } from 'react'
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

// Para ícones com hex preto (#000000) no light mode, usa o azul do projeto
function resolveColor(hex: string, dark: boolean): string {
  if (dark) return 'ffffff'
  if (hex === '000000' || hex === '111111') return '3b82f6'
  return hex
}

const STACK = [
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
]

const CSS = `
  @keyframes siMove {
    from { transform: translateX(0); }
    to   { transform: translateX(130vw); }
  }
`

const rand = (min: number, max: number) => Math.random() * (max - min) + min

function createItem(id: number, isDark: boolean) {
  const icon = STACK[Math.floor(Math.random() * STACK.length)]
  const size = Math.round(rand(28, 80))
  const color = resolveColor(icon.hex, isDark)
  // Injetar fill no SVG inline
  const svg = icon.svg.replace('<svg ', `<svg fill="#${color}" `)
  return {
    id,
    svg,
    alt: icon.title,
    top: rand(4, 94),
    left: rand(-16, -6),
    size,
    duration: rand(30, 55),
    delay: `${rand(0, 2).toFixed(1)}s`,
  }
}

type StackItem = ReturnType<typeof createItem>

interface Props {
  /** Quantidade inicial de ícones no estado */
  initialCount?: number
  /** Intervalo de spawn em ms */
  spawnInterval?: number
  /** Máximo de ícones simultâneos */
  maxIcons?: number
  /** Opacidade base */
  opacity?: number
}

export function StackIconTexture({
  initialCount = 8,
  spawnInterval = 900,
  maxIcons = 40,
  opacity = 0.10,
}: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const isDarkRef = useRef(isDark)
  isDarkRef.current = isDark

  const [items, setItems] = useState<StackItem[]>([])
  const nextId = useRef(1)

  useEffect(() => {
    const initial = Array.from({ length: initialCount }, (_, i) =>
      createItem(i + 1, isDarkRef.current)
    )
    setItems(initial)
    nextId.current = initial.length + 1
  }, [initialCount])

  useEffect(() => {
    const interval = setInterval(() => {
      const id = nextId.current++
      const item = createItem(id, isDarkRef.current)
      setItems((cur) => [...cur, item].slice(-maxIcons))
      setTimeout(
        () => setItems((cur) => cur.filter((i) => i.id !== id)),
        item.duration * 1000 + 2000
      )
    }, spawnInterval)
    return () => clearInterval(interval)
  }, [spawnInterval, maxIcons])

  return (
    <>
      <style>{CSS}</style>
      {items.map(({ id, svg, alt, top, left, size, duration, delay }) => (
        <span
          key={id}
          aria-label={alt}
          className="absolute select-none"
          style={{
            top: `${top}%`,
            left: `${left}vw`,
            width: size,
            height: size,
            opacity,
            animation: `siMove ${duration}s linear`,
            animationDelay: delay,
            animationFillMode: 'forwards',
            willChange: 'transform',
            display: 'inline-block',
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ))}
    </>
  )
}
