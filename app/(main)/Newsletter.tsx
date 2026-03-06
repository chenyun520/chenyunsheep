'use client'

import { LayoutGroup, motion } from 'framer-motion'
import React from 'react'

import { UsersIcon } from '~/assets'

import { ClerkUserStats } from '~/components/ClerkUserStats'
import { TextRotate } from '~/components/fancy/text/text-rotate'

export function Newsletter({ _subCount }: { _subCount?: string }) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-16 lg:gap-24">
      {/* 左侧：社区统计 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40 flex flex-col justify-center flex-shrink-0"
      >
        <div className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <UsersIcon className="h-5 w-5 flex-none" />
          <span className="ml-2">社区</span>
        </div>

        <ClerkUserStats
          fallback={
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              加载中...
            </p>
          }
          render={(users, totalUsers) => (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
              加入 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalUsers}</span> 位开发者
              一起探索技术与创新
            </p>
          )}
        />
      </motion.div>

      {/* 右侧：动画效果 */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40 flex items-center justify-center overflow-hidden flex-shrink-0"
      >
        <LayoutGroup>
          <div className="flex whitespace-pre text-lg sm:text-xl md:text-2xl font-light items-center">
            <span className="text-zinc-700 dark:text-zinc-300">
              Make it{' '}
            </span>
            <TextRotate
              texts={[
                'hares',
                'right',
                'fast',
              ]}
              mainClassName="text-white px-3 py-1.5 bg-gradient-to-r from-lime-500 to-emerald-500 overflow-hidden justify-center rounded-lg font-semibold inline-flex items-center"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden inline-block"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  )
}
