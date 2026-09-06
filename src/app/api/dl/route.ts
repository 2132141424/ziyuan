import { NextResponse } from 'next/server'
import { dlSign, findResource } from '@/lib/dl-sign'

// 下载端点：仅接受带有效签名的一次性链接并 302 到真实地址。
// 未带签名或签名无效/过期一律拒绝，避免手动拼 /api/dl?item=.. 即成为直链。
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

function errorHtml(title: string, msg: string, code: number): NextResponse {
  return new NextResponse(
    `<!doctype html><html lang="zh"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>` +
      `<body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f172a;color:#e2e8f0">` +
      `<div style="text-align:center;padding:2rem;max-width:28rem"><h1 style="font-size:1.6rem;margin:0 0 .75rem">${title}</h1>` +
      `<p style="color:#94a3b8;line-height:1.7;margin:0 0 1.5rem">${msg}</p>` +
      `<a href="/" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:.7rem 1.5rem;border-radius:.6rem;font-size:.95rem">返回资源中心</a>` +
      `</div></body></html>`,
    { status: code, headers: { 'content-type': 'text/html; charset=utf-8' } }
  )
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
  if (!t || !expRaw) {
    return errorHtml(
      '下载链接无效',
      '该资源的一次性下载链接无效或已过期。请返回资源中心，点击对应卡片的“下载”按钮重新获取下载链接。',
      403
    )
  }

  const exp = parseInt(expRaw, 10)
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return errorHtml('下载链接已过期', '该下载链接已超过 15 分钟有效期。请返回资源中心，点击“下载”按钮重新获取。', 410)
  }
  if (t !== dlSign(`${itemId}|${exp}`)) {
    return errorHtml('下载链接无效', '链接签名校验未通过，可能存在篡改。请返回资源中心重新获取下载链接。', 403)
  }

  let target = res.downloadUrl || res.href
  if (res.githubUrl && (await githubReachable(res.githubUrl))) {
    target = res.githubUrl
  }
  return NextResponse.redirect(target, 302)
}