// OpenAPI 3.1 描述：服务于 api-catalog 的 service-desc 关系。
// 外部经由 next.config.js 的 rewrite 从 /.well-known/openapi.json 进入本路由。
export const runtime = 'edge'

const ORIGIN = 'https://ziyuan.waterfish.ren'

const SPEC = {
  openapi: '3.1.0',
  info: {
    title: '资源中心 · 水鱼之家 公开接口',
    version: '1.0.0',
    description:
      '资源中心（ziyuan.waterfish.ren）对外公开的只读接口，用于获取导航数据、站点配置与资源下载一次性签名链接。',
    license: { name: 'Proprietary' },
  },
  servers: [{ url: ORIGIN }],
  paths: {
    '/api/navigation': {
      get: {
        operationId: 'getNavigation',
        summary: '获取导航数据',
        description: '返回全部分类、子分类与资源条目。',
        responses: {
          '200': {
            description: '导航数据',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/api/site': {
      get: {
        operationId: 'getSiteConfig',
        summary: '获取站点配置',
        responses: {
          '200': {
            description: '站点配置',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
    '/api/dl/sign': {
      get: {
        operationId: 'signDownload',
        summary: '签发一次性下载链接',
        description: '按资源 id 签发带 15 分钟时效签名的下载地址。',
        parameters: [
          { name: 'item', in: 'query', required: true, schema: { type: 'string' }, description: '资源条目 id' },
        ],
        responses: {
          '200': {
            description: '签名链接',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { url: { type: 'string' }, expiresAt: { type: 'string' } },
                },
              },
            },
          },
          '404': { description: '资源不存在' },
        },
      },
    },
    '/api/health': {
      get: {
        operationId: 'getHealth',
        summary: '健康状态',
        responses: {
          '200': {
            description: '服务状态',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
  },
}

export async function GET() {
  return new Response(JSON.stringify(SPEC, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.oai.openapi+json;version=3.1',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
