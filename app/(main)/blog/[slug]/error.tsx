'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Blog post error:', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        加载文章时出错
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {error.message || '请稍后重试'}
      </p>
      <button
        onClick={reset}
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        重试
      </button>
      <a
        href="/blog"
        className="mt-2 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        返回博客列表
      </a>
    </div>
  )
}
