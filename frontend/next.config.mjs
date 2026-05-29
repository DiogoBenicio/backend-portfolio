import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

/** @type {(phase: string) => import('next').NextConfig} */
export default function config(phase) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER

  return {
    // Em build (export estático) não pode ter rewrites.
    // Em dev server os rewrites proxiam /api/* para o gateway local.
    output: isDev ? undefined : 'export',
    trailingSlash: false,
    images: {
      unoptimized: true,
    },
    // Lint e typecheck rodam separadamente no CI — não bloquear o build Docker
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: false },
    ...(isDev && {
      async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'http://localhost:4000/api/:path*',
          },
        ]
      },
    }),
  }
}
