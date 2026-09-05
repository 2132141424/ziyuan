import { Metadata } from 'next'
import navigationData from '@/navsphere/content/navigation.json'
import type { NavigationSubItem } from '@/types/navigation'

// 访问 /xuanchuan?id=<资源id>（兼容 /xuanchuan?=<id>）时渲染该资源的宣传落地页
function findItem(id: string): NavigationSubItem | undefined {
  for (const cat of navigationData.navigationItems) {
    for (const item of cat.items ?? []) {
      if (item.id === id) return item
    }
    for (const sub of cat.subCategories ?? []) {
      for (const item of sub.items ?? []) {
        if (item.id === id) return item
      }
    }
  }
}

// 把「植物大战僵尸·杂交版」拆成主标题 + 括号副标题
function splitTitle(title: string): [string, string] {
  const m = title.match(/^(.+?)[·・](.+)$/)
  if (m) return [m[1].trim(), `（${m[2].trim()}）`]
  const s = title.match(/^(.+?)[｜|](.+)$/)
  if (s) return [s[1].trim(), `（${s[2].trim()}）`]
  return [title, '']
}

// 兼容 ?id=<id> 与 ?=<id> 两种形式
function extractId(
  sp: Record<string, string | string[] | undefined>
): string {
  if (typeof sp.id === 'string' && sp.id) return sp.id
  if (typeof sp[''] === 'string' && sp['']) return sp['']
  const v = Object.values(sp).find(
    (x): x is string => typeof x === 'string'
  )
  return v ?? ''
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const sp = await searchParams
  const raw = extractId(sp)
  const item = raw ? findItem(raw) : undefined
  return {
    title: item ? `下载${item.title}` : '资源 · 水鱼之家',
  }
}

export default async function XuanChuanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const raw = extractId(sp)
  const item = raw ? findItem(raw) : undefined

  const [title, subTitle] = splitTitle(item?.title ?? '资源中心')
  // 「立刻下载」：有下载源时直接跳转下载；否则先跳回资源中心聚焦该卡片
  const downloadHref = item?.downloadUrl || (raw ? `/?focus=${raw}` : '/')
  const hint = item?.description?.split('｜')[0] || ''

  return (
    <div className="xz-wrap">
      <nav className="xz-navbar">
        <a className="xz-logo-link" href="https://waterfish.ren">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://waterfish.ren/favicon.ico" alt="水鱼之家" />
          <span className="xz-brand-text">水鱼之家</span>
        </a>
        <div className="xz-nav-links">
          <a href="https://waterfish.ren">更多服务</a>
          <a href="https://board.waterfish.ren">留言板</a>
          <a href="https://blog.waterfish.ren">博客</a>
          <a className="xz-cta" href="https://ziyuan.waterfish.ren">
            资源中心[找游戏]
          </a>
        </div>
      </nav>

      <div className="xz-page">
        <div className="xz-bg-right" />
        <div className="xz-content">
          <div className="xz-col-left">
            <div className="xz-t1" style={{ marginBottom: 14 }}>
              下载<span className="xz-star">✦</span>
            </div>
            <div className="xz-t2" style={{ marginTop: 16 }}>
              {title}
            </div>
            {subTitle && <div className="xz-t3">{subTitle}</div>}
          </div>
          <div className="xz-col-right">
            <div>
              <a className="xz-btn-now" href={downloadHref} target="_blank" rel="noopener noreferrer">
                立刻下载<span className="xz-arr">→</span>
              </a>
              {hint && <div className="xz-hint">{hint}</div>}
              <div className="xz-remember">
                <span className="xz-pin">📌</span>
                <span>
                  记住我们的网址：<b>waterfish.ren</b>
                  <br />
                  或搜索<b>「水鱼之家」</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}