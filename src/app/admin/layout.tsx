import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminLayoutClient } from './AdminLayoutClient'
import { Toaster } from "@/registry/new-york/ui/toaster"
import { Metadata } from 'next'

export const runtime = 'edge'


export const metadata: Metadata = {
  title: '水鱼之家 · 管理后台',
  description: '水鱼之家 Admin Dashboard',
  icons: {
    icon: '/assets/images/icon.png',
    shortcut: '/assets/images/icon.png',
    apple: '/assets/images/icon.png',
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <>
      <AdminLayoutClient
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        }}
      >
        {children}
      </AdminLayoutClient>
      <Toaster />
    </>
  )
} 