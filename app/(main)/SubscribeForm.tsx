'use client'

import React from 'react'

// 邮箱订阅表单：POST {email} → /api/newsletter
export function SubscribeForm() {
  const [email, setEmail] = React.useState('')
  const [status, setStatus] = React.useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = React.useState('')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'pending') return
    setStatus('pending')
    setMessage('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('success')
      setEmail('')
      setMessage('订阅成功！请到邮箱点击确认邮件完成订阅～')
    } catch {
      setStatus('error')
      setMessage('订阅失败，请稍后再试或换个邮箱')
    }
  }

  return (
    <div className="mx-auto mb-8 max-w-md">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        邮件订阅
      </h2>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        新文章第一时间送到你的邮箱，绝不发垃圾邮件。
      </p>
      <form onSubmit={onSubmit} className="mt-3 flex items-center gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="邮箱地址"
          className="block w-full rounded-lg bg-zinc-100/80 px-3 py-1.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none ring-1 ring-zinc-200/50 transition focus:ring-lime-400/60 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700/50"
        />
        <button
          type="submit"
          disabled={status === 'pending'}
          className="shrink-0 rounded-lg bg-gradient-to-r from-lime-500 to-emerald-500 px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'pending' ? '订阅中...' : '订阅'}
        </button>
      </form>
      {message ? (
        <p
          className={
            status === 'success'
              ? 'mt-2 text-xs text-green-600 dark:text-green-400'
              : 'mt-2 text-xs text-red-500 dark:text-red-400'
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
