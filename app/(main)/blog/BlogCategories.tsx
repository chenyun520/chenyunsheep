'use client'

import { clsxm } from '@zolplay/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

interface Category {
  _id: string
  title: string
  slug: string
  description?: string
}

interface BlogCategoriesProps {
  categories: Category[]
}

export function BlogCategories({ categories }: BlogCategoriesProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  const createCategoryUrl = (categorySlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categorySlug) {
      params.set('category', categorySlug)
    } else {
      params.delete('category')
    }
    return `${pathname}?${params.toString()}`
  }

  const allCategories = [
    { _id: 'all', title: '全部', slug: null as string | null },
    ...categories,
  ]

  return (
    <div className="mb-10">
      {/* 分类标签 - 全新设计 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {allCategories.map((category, index) => {
            const isActive = category.slug === null
              ? currentCategory === null
              : currentCategory === category.slug

            return (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.04,
                  ease: 'easeOut',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={createCategoryUrl(category.slug)}
                  className={clsxm(
                    'relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                    'border shadow-sm text-black',
                    // 未选中状态
                    !isActive &&
                      'bg-white border-zinc-200 shadow-zinc-100/50 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md dark:bg-zinc-800 dark:border-zinc-700 dark:shadow-zinc-900/20 dark:hover:bg-zinc-700 dark:hover:border-zinc-600',
                    // 选中状态 - 绿色渐变背景，但文字还是黑色
                    isActive &&
                      'bg-gradient-to-r from-emerald-450 to-lime-500 border-transparent shadow-lg shadow-emerald-500/25'
                  )}
                >
                  {/* 分类名称 */}
                  <span>{category.title}</span>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* 当前筛选状态 - 简化版 */}
      {currentCategory && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 text-sm"
        >
          <span className="text-zinc-500 dark:text-zinc-400">筛选:</span>
          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
            {categories.find((c) => c.slug === currentCategory)?.title || currentCategory}
          </span>
          <Link
            href={createCategoryUrl(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors underline underline-zinc-300 underline-offset-2 decoration-zinc-300/50 hover:decoration-zinc-400 dark:decoration-zinc-700 dark:hover:decoration-zinc-500 text-xs"
          >
            重置
          </Link>
        </motion.div>
      )}
    </div>
  )
}
