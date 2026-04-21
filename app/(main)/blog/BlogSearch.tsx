'use client'

import { clsxm } from '@zolplay/utils'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function BlogSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get('q') ?? ''
  const [value, setValue] = React.useState(currentQuery)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>()

  const updateSearch = React.useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (q) {
        params.set('q', q)
        params.delete('category')
      } else {
        params.delete('q')
      }
      router.push(`/blog?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setValue(v)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => updateSearch(v), 300)
    },
    [updateSearch]
  )

  const onClear = React.useCallback(() => {
    setValue('')
    updateSearch('')
    inputRef.current?.focus()
  }, [updateSearch])

  // Sync value when URL changes
  React.useEffect(() => {
    setValue(currentQuery)
  }, [currentQuery])

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="relative"
    >
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          placeholder="搜索文章标题或内容..."
          className={clsxm(
            'w-full pl-10 pr-10 py-2.5 rounded-xl text-sm',
            'bg-white border border-zinc-200 shadow-sm',
            'placeholder:text-zinc-400 text-zinc-800',
            'focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500',
            'transition-all duration-200',
            'dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200',
            'dark:placeholder:text-zinc-500 dark:focus:ring-lime-400/50 dark:focus:border-lime-400'
          )}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {currentQuery && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            搜索: &quot;{currentQuery}&quot;
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-lime-600 dark:text-lime-400 hover:underline"
          >
            清除搜索
          </button>
        </div>
      )}
    </motion.div>
  )
}
