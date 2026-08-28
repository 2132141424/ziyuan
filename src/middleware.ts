import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 兼容 /xuanchuan?=<id> 的无键名参数形式：内部 rewrite 为 ?id=<id>（地址栏不变）
  if (pathname === '/xuanchuan' && !searchParams.get('id')) {
    const emptyVal = searchParams.get('')
    if (emptyVal) {
      const url = request.nextUrl.clone()
      url.searchParams.set('id', emptyVal)
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