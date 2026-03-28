/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'openweathermap.org' },
    ],
  },
  async rewrites() {
    const gatewayUrl = process.env.GATEWAY_URL ?? 'http://localhost:4000'
    return [
      {
        source: '/api/:path*',
        destination: `${gatewayUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
