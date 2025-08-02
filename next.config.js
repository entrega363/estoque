/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração otimizada para Vercel
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
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
    ]
  },
}

module.exports = nextConfig