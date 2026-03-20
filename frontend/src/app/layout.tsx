import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { RateLimitModal } from '@/components/ui/ratelimitmodal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Diogo Benício — Full Stack Engineer',
  description:
    'Portfólio técnico: APIs com Java Spring Boot, Node.js e dashboard Next.js. Arquitetura hexagonal, Elasticsearch, PostgreSQL.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <RateLimitModal />
        </Providers>
      </body>
    </html>
  )
}
