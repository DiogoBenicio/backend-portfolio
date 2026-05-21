'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageLoader } from './PageLoader'

export function NavigationProgress() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  // Limpa quando a navegação completa (pathname mudou)
  useEffect(() => {
    setLoading(false)
  }, [pathname])

  // Intercepta cliques em links internos
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return
      if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) return
      if (anchor.target === '_blank') return
      if (href === pathname) return

      setLoading(true)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  if (!loading) return null

  return <PageLoader />
}
