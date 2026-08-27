import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import type { DefaultSession, NextAuthConfig } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      accessToken?: string
    } & DefaultSession['user']
  }
  interface JWT {
    accessToken?: string
  }
  interface User {
    accessToken?: string
  }
}

const config = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        // repo: 向仓库写数据；user:email: 读取用户邮箱用于后台白名单校验
        params: { scope: 'read:user user:email repo' }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // 仅允许白名单邮箱登录后台，未配置 ADMIN_EMAILS 时默认拒绝
      const allowed = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean)
      if (allowed.length === 0) return false
      return allowed.includes((user.email ?? '').toLowerCase())
    },
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.accessToken = token.accessToken as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.AUTH_SECRET || process.env.GITHUB_CLIENT_SECRET
} satisfies NextAuthConfig

const handler = NextAuth(config)

export const auth = handler.auth
export const { handlers: { GET, POST } } = handler