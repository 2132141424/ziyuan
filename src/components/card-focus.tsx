'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

// 访问 ?focus=<卡片id> 时：平滑定位到指定资源卡片 → 就地放大 + 半透明遮罩 → 短暂停留后缩小回原位
export function CardFocus() {
  const params = useSearchParams()
  const focusId = params.get('focus')
  const ranRef = useRef(false)

  useEffect(() => {
    if (!focusId || ranRef.current) return
    ranRef.current = true

    let overlay: HTMLDivElement | null = null
    let shrinkTimer: ReturnType<typeof setTimeout> | undefined
    let removeTimer: ReturnType<typeof setTimeout> | undefined

    const run = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-card-id="${CSS.escape(focusId)}"]`
      )
      if (!el) return

      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

      overlay = document.createElement('div')
      overlay.className = 'card-focus-overlay'
      document.body.appendChild(overlay)

      setTimeout(() => {
        el.classList.add('card-focus-active')
        shrinkTimer = setTimeout(() => {
          el.classList.remove('card-focus-active')
          removeTimer = setTimeout(() => overlay?.remove(), 650)
        }, 1600)
      }, 500) // 等平滑滚动大体到位后再放大
    }

    const timer = window.setTimeout(run, 300)

    return () => {
      window.clearTimeout(timer)
      if (shrinkTimer) clearTimeout(shrinkTimer)
      if (removeTimer) clearTimeout(removeTimer)
      overlay?.remove()
    }
  }, [focusId])

  return null
}