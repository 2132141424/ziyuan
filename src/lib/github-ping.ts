// 打开网站时用 <img> 静默探测 GitHub 是否可直连，结果缓存供下载按钮复用。
// 用 Image 而非 fetch：no-cors、纯加载不读响应，尽量避免触发浏览器本地网络访问弹窗。
let _started = false
let _resolved: boolean | null = null

export function githubReachable(): boolean {
  return _resolved === true
}

export function ensureGithubPing(): void {
  if (_started || typeof window === 'undefined') return
  _started = true
  const img = new Image()
  const timer = window.setTimeout(() => {
    _resolved = false
  }, 3000)
  img.onload = () => {
    window.clearTimeout(timer)
    _resolved = true
  }
  img.onerror = () => {
    window.clearTimeout(timer)
    _resolved = false
  }
  img.referrerPolicy = 'no-referrer'
  img.src = 'https://github.com/favicon.ico'
}