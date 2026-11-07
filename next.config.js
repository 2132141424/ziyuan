/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone build for Cloudflare Pages
  // Note: Most routes use 'edge' runtime which is compatible with Cloudflare
  output: 'standalone',

  // Don't fail build on ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      'dash.cloudflare.com',
      'www.google.com',
      'ph-static.imgix.net',
      'app.leonardo.ai'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      {
        source: '/auth/:path*',
        destination: '/auth/:path*'
      },
      // RFC 9727 等机器可读资源：路径无扩展名，交给路由处理器精确声明 Content-Type
      {
        source: '/.well-known/api-catalog',
        destination: '/api/well-known/api-catalog'
      },
      {
        source: '/.well-known/openapi.json',
        destination: '/api/well-known/openapi'
      }
    ]
  },
  // 首页响应头：补 Agent 发现用的 Link 关系（RFC 8288 / RFC 9727）
  async headers() {
    const discoveryLinks = [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</.well-known/openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
      '</docs/api.html>; rel="service-doc"; type="text/html"',
      '</llms.txt>; rel="describedby"; type="text/plain"'
    ].join(', ')

    return [
      {
        source: '/',
        headers: [
          { key: 'Link', value: discoveryLinks },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ]
      },
      {
        source: '/docs/api.html',
        headers: [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }]
      },
      {
        source: '/llms.txt',
        headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }]
      }
    ]
  },
  // Cloudflare Pages configuration
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'newkit.site']
    },
    optimizePackageImports: ['lucide-react', 'date-fns', 'lodash']
  }
}

module.exports = nextConfig
