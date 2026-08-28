'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Info, Play, Globe, Download, type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/registry/new-york/ui/card'
import { Icons } from '@/components/icons'
import { PREVIEW_BASE_URL } from '@/config/site'
import type { NavigationSubItem } from '@/types/navigation'
import { SiteFavicon } from '@/components/site-favicon'
import type { SiteConfig } from '@/types/site'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

interface NavigationCardProps {
  item: NavigationSubItem
  siteConfig?: SiteConfig
}

function ActionButton({
  href,
  icon: Icon,
  label,
  variant = 'default',
}: {
  href: string
  icon: LucideIcon
  label: string
  variant?: 'default' | 'outline'
}) {
  const base =
    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap'
  const styles =
    variant === 'outline'
      ? 'border border-border bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground'
      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`${base} ${styles}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}

export function NavigationCard({ item, siteConfig }: NavigationCardProps) {
  // 获取链接打开方式，默认为新窗口
  const linkTarget = siteConfig?.navigation?.linkTarget || '_blank'

  // 可在线预览(html)时显示“在线预览”，否则显示“项目页面”（优先指向项目主页，无主页字段时回退到 href）
  const canPreview = Boolean(item.previewPath)
  const primaryHref = canPreview
    ? `${PREVIEW_BASE_URL}${item.previewPath}`
    : item.projectUrl || item.href
  const primaryLabel = canPreview ? '在线预览' : '项目页面'
  const primaryIcon = canPreview ? Play : Globe
  const downloadHref = item.downloadUrl || item.href

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card data-card-id={item.id} className="group relative overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg card-focusable">
            <Link
              href={item.href}
              target={linkTarget}
              rel="noopener noreferrer"
              className="block h-full pb-2"
            >
              <CardHeader>
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-11 sm:h-11">
                    <SiteFavicon
                      title={item.title}
                      icon={item.icon}
                      useDefaultIcon={item.useDefaultIcon}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-0.5 sm:space-y-1">
                    <CardTitle className="text-sm sm:text-base">{item.title}</CardTitle>
                    {item.description && (
                      <CardDescription className="text-xs sm:text-sm line-clamp-1">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Link>
            {item.about && (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="关于"
                    title="关于"
                    className="absolute top-2 right-2 z-10 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="pr-6">{item.title}</DialogTitle>
                    <DialogDescription className="whitespace-pre-line leading-relaxed text-foreground/80">
                      {item.about}
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
            {/* hover 操作按钮 */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 p-2 bg-gradient-to-t from-background via-background/85 to-transparent opacity-0 translate-y-3 transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
              {(canPreview || item.projectUrl) && (
                <ActionButton href={primaryHref} icon={primaryIcon} label={primaryLabel} />
              )}
              <ActionButton
                href={downloadHref}
                icon={Download}
                label="下载"
                variant="outline"
              />
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="center"
          sideOffset={8}
          className="max-w-[280px] text-xs sm:text-sm"
        >
          <p>{item.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}