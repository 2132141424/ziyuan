import { auth } from '@/lib/auth'
import { stringToBase64 } from '@/lib/buffer-utils'

export async function getFileContent(path: string) {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'

  try {
    const session = await auth()
    const token = session?.user?.accessToken

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`

    const ghFetch = (tok: string) =>
      fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3.raw',
          Authorization: tok ? `token ${tok}` : '',
          'User-Agent': 'NavSphere',
          cache: 'no-store',
        },
      })

    // 带用户 token 被 GitHub 拒绝(401/403)时回退匿名读取：
    // 公开仓库可直接匿名读取，避免失效 token 导致后台读取为空数组
    let response = await ghFetch(token || '')
    if (token && (response.status === 401 || response.status === 403)) {
      response = await ghFetch('')
    }

    if (response.status === 404) {
      console.log(`File not found: ${path}, returning default data`)
      if (path.includes('navigation.json')) {
        return { navigationItems: [] }
      }
      return {}
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching file:', error)
    if (path.includes('navigation.json')) {
      return { navigationItems: [] }
    }
    return {}
  }
}

export async function commitFile(
  path: string,
  content: string,
  message: string,
  token: string,
  retryCount = 3
) {
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const branch = process.env.GITHUB_BRANCH || 'main'

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // 1. 获取当前文件信息（如果存在）
      const currentFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
      const currentFileResponse = await fetch(currentFileUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'NavSphere',
        },
        cache: 'no-store', // 禁用缓存，确保获取最新的文件信息
      })

      let sha = undefined
      if (currentFileResponse.ok) {
        const currentFile = await currentFileResponse.json()
        sha = currentFile.sha
      }

      // 2. 创建或更新文件
      const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'NavSphere',
        },
        body: JSON.stringify({
          message,
          content: stringToBase64(content),
          sha,
          branch,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (attempt < retryCount && error.message?.includes('sha')) {
          console.log(`Attempt ${attempt} failed, retrying after delay...`)
          await delay(1000 * attempt) // 指数退避
          continue
        }
        throw new Error(`Failed to commit file: ${error.message}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt === retryCount) {
        console.error('Error in commitFile:', error)
        throw error
      }
      console.log(`Attempt ${attempt} failed, retrying...`)
      await delay(1000 * attempt)
    }
  }
} 