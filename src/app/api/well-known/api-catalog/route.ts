// RFC 9727 API 目录：供 Agent 自动发现本站公开接口。
// 外部经由 next.config.js 的 rewrite 从 /.well-known/api-catalog 进入本路由，
// 以保证 Content-Type 为规范的 application/linkset+json。
export const runtime = 'edge'

const ORIGIN = 'https://ziyuan.waterfish.ren'

const CATALOG = {
  linkset: [
    {
      anchor: `${ORIGIN}/api`,
      'service-desc': [
        { href: `${ORIGIN}/.well-known/openapi.json`, type: 'application/vnd.oai.openapi+json' },
      ],
      'service-doc': [{ href: `${ORIGIN}/docs/api.html`, type: 'text/html' }],
      status: [{ href: `${ORIGIN}/api/health`, type: 'application/json' }],
    },
  ],
}

export async function GET() {
  return new Response(JSON.stringify(CATALOG), {
    status: 200,
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
