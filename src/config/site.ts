import type { SiteConfig } from '@/types/site'

// 4everland/EdgeOne 在线预览站根域名（部署后请在 site.json 的 preview.host 覆盖）
export const PREVIEW_BASE_URL = process.env.NEXT_PUBLIC_PREVIEW_HOST || 'https://dow.ziyuan.waterfish.ren'

export const siteConfig: SiteConfig = {
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
}

export function getSiteConfig(): SiteConfig {
  return siteConfig
}
