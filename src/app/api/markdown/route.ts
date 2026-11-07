import navigationRaw from '@/navsphere/content/navigation.json'
import siteRaw from '@/navsphere/content/site.json'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'

// 资源站的 Markdown 表示：由 middleware 在 Accept: text/markdown 时内部 rewrite 过来。
export const runtime = 'edge'

const SITE_ORIGIN = 'https://ziyuan.waterfish.ren'

// 支持转 Markdown 的页面路径
const SUPPORTED_PATHS = new Set(['/', '/index.html'])

interface NavItemLike extends NavigationSubItem {
  url?: string
}

function itemLines(item: NavItemLike): string[] {
  const desc = item.description ? ` — ${item.description}` : ''
  const link = item.href || item.url || ''
  return [`- **${item.title}**${desc}`, link ? `  ${link}` : ''].filter(Boolean)
}

function toMarkdown(): string {
  const site = siteRaw as { basic: { title: string; description: string; keywords?: string } }
  const data = navigationRaw as unknown as NavigationData

  const lines: string[] = []
  lines.push(`# ${site.basic.title}`)
  lines.push('')
  lines.push(`> ${site.basic.description}`)
  lines.push('')
  lines.push(`- 站点：${SITE_ORIGIN}`)
  lines.push('- 上级站点：https://waterfish.ren')
  if (site.basic.keywords) lines.push(`- 关键词：${site.basic.keywords}`)
  lines.push('')

  for (const category of data.navigationItems as NavigationItem[]) {
    lines.push(`## ${category.title}`)
    lines.push('')
    if (category.description) {
      lines.push(`> ${category.description}`)
      lines.push('')
    }

    for (const item of (category.items ?? []) as NavItemLike[]) {
      lines.push(...itemLines(item))
    }
    if (category.items?.length) lines.push('')

    for (const sub of category.subCategories ?? []) {
      if (sub.description) {
        lines.push(`### ${sub.title}`)
        lines.push('')
        lines.push(`> ${sub.description}`)
        lines.push('')
      } else {
        lines.push(`### ${sub.title}`)
        lines.push('')
      }
      for (const item of (sub.items ?? []) as NavItemLike[]) {
        lines.push(...itemLines(item))
      }
      lines.push('')
    }
  }

  lines.push('## 机器可读资源')
  lines.push('')
  lines.push(`- API 目录：${SITE_ORIGIN}/.well-known/api-catalog`)
  lines.push(`- OpenAPI：${SITE_ORIGIN}/.well-known/openapi.json`)
  lines.push(`- 接口文档：${SITE_ORIGIN}/docs/api.html`)
  lines.push(`- llms.txt：${SITE_ORIGIN}/llms.txt`)
  lines.push('')
  lines.push('## 版权')
  lines.push('')
  lines.push('本站仅作资源索引导航，跳转均指向原作者/官方出处，版权归各自所有者。')
  lines.push('')

  return lines.join('\n')
}

/** 粗略 token 估算：CJK 约 1 字 1 token，其余约 4 字符 1 token */
function estimateTokens(text: string): number {
  const cjk = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff]/g) || []).length
  const rest = Math.max(0, text.length - cjk)
  return Math.max(1, Math.round(cjk + rest / 4))
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'

  if (!SUPPORTED_PATHS.has(path)) {
    return new Response('markdown not available for this path', { status: 404 })
  }

  const text = toMarkdown()
  return new Response(text, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'x-markdown-tokens': String(estimateTokens(text)),
      'x-markdown-source': path,
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
