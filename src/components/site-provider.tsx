'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { SiteConfig } from '@/types/site'

const SiteContext = createContext<{
  siteInfo: SiteConfig | null
  isLoading: boolean
  error: Error | null
}>({
  siteInfo: null,
  isLoading: true,
  error: null,
})

export function useSiteInfo() {
  return useContext(SiteContext)
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteInfo, setSiteInfo] = useState<SiteConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadSiteInfo() {
      try {
        const response = await fetch('/api/site-config')
        if (!response.ok) {
          throw new Error('Failed to fetch site config')
        }
        const data = await response.json()
        setSiteInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        // 设置默认值
        setSiteInfo({
          basic: {
            title: '水鱼之家',
            description: '汇集网页小游戏、我的世界工具与常用网站导航',
            keywords: '资源导航,小游戏,我的世界,网页游戏,工具导航,游戏下载'
          },
          appearance: {
            logo: '/assets/images/icon.png',
            favicon: '/assets/images/favicon.ico',
            theme: 'system'
          },
          navigation: {
            linkTarget: '_blank'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSiteInfo()
  }, [])

  return (
    <SiteContext.Provider value={{ siteInfo, isLoading, error }}>
      {children}
    </SiteContext.Provider>
  )
}
