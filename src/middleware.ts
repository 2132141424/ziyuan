import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 直接解析原始查询串中的无键名参数，如 ?=<id>（避免依赖 Edge 下 URLSearchParams 的空键行为）
function parseEmptyKeyQuery(search: string): string {
  const q = search.startsWith('?') ? search.slice(1) : search
  for (const seg of q.split('&')) {
    if (seg.startsWith('=')) {
      const v = seg.slice(1)
      try {
        return decodeURIComponent(v)
      } catch {
        return v
      }
    }
  }
  return ''
}

// 有 Markdown 表示的页面
const MARKDOWN_PAGES = new Set(['/', '/index.html'])

/** Accept 是否明确偏好 text/markdown（仅通配符不算，浏览器与 curl 默认仍拿 HTML） */
function prefersMarkdown(accept: string): boolean {
  if (!accept) return false
  const lower = accept.toLowerCase()
  if (!lower.includes('text/markdown')) return false

  const qOf = (type: string): number => {
    for (const part of lower.split(',')) {
      const [rawType, ...params] = part.trim().split(';')
      if (rawType.trim() !== type) continue
      let q = 1
      for (const p of params) {
        const [k, v] = p.split('=')
        if (k && k.trim() === 'q') q = Number.parseFloat(v) || 0
      }
      return q
    }
    return 0
  }

  const qMd = qOf('text/markdown')
  return qMd > 0 && qMd >= qOf('text/html')
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Markdown 内容协商：Accept 明确要 text/markdown 时，内部 rewrite 到 Markdown 路由（地址栏不变）
  if (MARKDOWN_PAGES.has(pathname) && prefersMarkdown(request.headers.get('accept') || '')) {
    const url = request.nextUrl.clone()
    url.pathname = '/api/markdown'
    url.search = `?path=${encodeURIComponent(pathname)}`
    return NextResponse.rewrite(url)
  }

  // 兼容 /xuanchuan?=<id> 的无键名参数形式：内部 rewrite 为 ?id=<id>（地址栏不变）
  if (pathname === '/xuanchuan' && !searchParams.get('id')) {
    const val = parseEmptyKeyQuery(request.nextUrl.search)
    if (val) {
      const url = request.nextUrl.clone()
      url.search = `?id=${encodeURIComponent(val)}`
      return NextResponse.rewrite(url)
    }
  }

  if (pathname.startsWith('/admin')) {
    const session = await auth()

    if (!session?.user) {
      const callbackUrl = request.url
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/xuanchuan']
}