/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desabilitar verificação de tipos durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuração otimizada para Vercel
  serverExternalPackages: ['@supabase/supabase-js'],
  // Configurações PWA
  experimental: {
    webpackBuildWorker: true,
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig