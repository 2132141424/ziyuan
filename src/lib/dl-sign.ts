import crypto from 'node:crypto'
import navData from '@/navsphere/content/navigation.json'
import type { NavigationData, NavigationSubItem } from '@/types/navigation'

export const DL_SECRET = process.env.DOWNLOAD_SIGN_SECRET || 'waterfish-dl-sign-2026'
export const DL_TTL_MS = 15 * 60 * 1000

export function findResource(itemId: string): NavigationSubItem | null {
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

export function dlSign(payload: string): string {
  return crypto.createHmac('sha256', DL_SECRET).update(payload).digest('hex')
}

// 生成一次性签名下载 URL（带 t/exp 参数），只能经此 URL 下载
export function makeSignedUrl(origin: string, itemId: string): { url: string; expiresAt: string } {
  const exp = Date.now() + DL_TTL_MS
  const sig = dlSign(`${itemId}|${exp}`)
  const u = new URL('/api/dl', origin)
  u.searchParams.set('item', itemId)
  u.searchParams.set('t', sig)
  u.searchParams.set('exp', String(exp))
  return { url: u.toString(), expiresAt: new Date(exp).toISOString() }
}