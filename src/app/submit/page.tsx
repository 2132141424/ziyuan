import { Metadata } from 'next/types'
import { Container } from '@/components/ui/container'
import { SubmissionForm } from '@/components/submission-form'
import navigationData from '@/navsphere/content/navigation.json'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/registry/new-york/ui/button'
import { NavigationData } from '@/types/navigation'

export const metadata: Metadata = {
    title: '资源投稿',
    description: '向水鱼之家投稿优质资源，分享好内容'
}

export default function SubmitPage() {
    return (
        <Container>
            <div className="min-h-screen py-8 px-4">
                {/* 返回按钮 */}
                <div className="max-w-2xl mx-auto mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 hover:bg-muted">
                            <ArrowLeft className="h-4 w-4" />
                            返回首页
                        </Button>
                    </Link>
                </div>

                {/* 投稿表单 */}
                <SubmissionForm navigationData={navigationData as unknown as NavigationData} />

                {/* 投稿说明 */}
                <div className="max-w-2xl mx-auto mt-8 p-6 rounded-xl bg-muted/50">
                    <h3 className="font-semibold mb-3">📋 投稿须知</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>请确保提交的资源内容合法、健康、有价值</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>资源地址请填写完整的 URL（包含 https://）</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>资源描述请简洁明了，突出资源的核心功能和特点</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>投稿提交后将通过 GitHub Issues 进行管理</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>我们会尽快审核您的投稿，审核通过后将添加到导航列表</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Container>
    )
}
