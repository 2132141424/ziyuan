import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import navData from '@/navsphere/content/navigation.json'
import type { NavigationData, NavigationSubItem } from '@/types/navigation'

// 一次性下载短链：服务端签发 15 分钟签名，前端不再暴露真实下载地址。
const SECRET = process.env.DOWNLOAD_SIGN_SECRET || 'waterfish-dl-sign-2026'
const TTL_MS = 15 * 60 * 1000

function findResource(itemId: string): NavigationSubItem | null {
  const data = navData as unknown as NavigationData
  for (const cat of data.navigationItems ?? []) {
    for (const it of cat.items ?? []) {
      if (it.id === itemId) return it
    }
    for (const sub of cat.subCategories ?? []) {
      for (const it of sub.items ?? []) {
        if (it.id === itemId) return it
      }
    }
  }
  return null
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('hex')
}

// 服务端侧探测 GitHub 源是否可达；不可达则回落 dow 备用源
async function githubReachable(url: string): Promise<boolean> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal })
    return r.ok || r.status < 500
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const itemId = url.searchParams.get('item') || ''
  const t = url.searchParams.get('t')
  const expRaw = url.searchParams.get('exp')

  const res = findResource(itemId)
  if (!res) {
    return NextResponse.json({ error: 'resource not found' }, { status: 404 })
  }

  // 已带签名：校验时效与签名后 302 到真实下载地址
  if (t && expRaw) {
    const exp = parseInt(expRaw, 10)
    if (!Number.isFinite(exp) || exp < Date.now()) {
      return new NextResponse('download link expired', { status: 410 })
    }
    if (t !== sign(`${itemId}|${exp}`)) {
      return new NextResponse('forbidden', { status: 403 })
    }
    let target = res.downloadUrl || res.href
    if (res.githubUrl && (await githubReachable(res.githubUrl))) {
      target = res.githubUrl
    }
    return NextResponse.redirect(target, 302)
  }

  // 未带签名：签发一次性签名短链。前端点击下载后经 json=1 获取该链接，签名于点击时生成
  const exp = Date.now() + TTL_MS
  const sig = sign(`${itemId}|${exp}`)
  const next = new URL('/api/dl', url.origin)
  next.searchParams.set('item', itemId)
  next.searchParams.set('t', sig)
  next.searchParams.set('exp', String(exp))
  if (url.searchParams.get('json') === '1') {
    return NextResponse.json({
      url: next.toString(),
      expiresAt: new Date(exp).toISOString(),
    })
  }
  return NextResponse.redirect(next.toString(), 302)
}