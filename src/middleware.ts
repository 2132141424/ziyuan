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

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

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
  matcher: ['/admin/:path*', '/xuanchuan']
}