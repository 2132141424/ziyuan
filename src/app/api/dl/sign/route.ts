import { NextResponse } from 'next/server'
import { findResource, makeSignedUrl } from '@/lib/dl-sign'

// 签发端点：由前端「下载」按钮调用，返回带 15 分钟时效签名的下载 URL。
export async function GET(request: Request) {
  const url = new URL(request.url)
  const itemId = url.searchParams.get('item') || ''

  const res = findResource(itemId)
  if (!res) {
    return NextResponse.json({ error: 'resource not found' }, { status: 404 })
  }
  const { url: signedUrl, expiresAt } = makeSignedUrl(url.origin, itemId)
  return NextResponse.json({ url: signedUrl, expiresAt })
}