'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

import { UsersIcon } from '~/assets'
import { ClerkUserStats } from '~/components/ClerkUserStats'
import { TextRotate } from '~/components/fancy/text/text-rotate'

const FIXED_MEMBERS = 25

// 模拟社区成员的名字和渐变色
const SIMULATED_USERS = [
  { name: '小明', gradient: 'from-sky-400 to-blue-500' },
  { name: '小红', gradient: 'from-rose-400 to-pink-500' },
  { name: '大卫', gradient: 'from-amber-400 to-orange-500' },
  { name: 'Luna', gradient: 'from-violet-400 to-purple-500' },
]

function UserAvatar({ user, zIndex }: { user: { image_url?: string; full_name?: string; first_name?: string; id: string }; zIndex: number }) {
  const initial = (user.full_name || user.first_name || '?')[0].toUpperCase()
  return (
    <div
      className="relative h-8 w-8 rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800 overflow-hidden bg-gradient-to-br from-lime-400 to-emerald-500 shrink-0"
      style={{ zIndex }}
    >
      {user.image_url ? (
        <Image src={user.image_url} alt={user.full_name || 'User'} fill className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-medium text-white">
          {initial}
        </span>
      )}
    </div>
  )
}

function SimulatedAvatar({ name, gradient, zIndex }: { name: string; gradient: string; zIndex: number }) {
  return (
    <div
      className={`relative h-8 w-8 rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800 overflow-hidden bg-gradient-to-br ${gradient} shrink-0`}
      style={{ zIndex }}
    >
      <span className="flex h-full w-full items-center justify-center text-xs font-medium text-white">
        {name[0]}
      </span>
    </div>
  )
}

export function Newsletter({ _subCount }: { _subCount?: string }) {
  return (
    <div className="flex flex-col md:flex-row gap-16 max-w-4xl mx-auto">
      {/* 卡片一：社区统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 relative rounded-[30px] px-8 py-5
                   bg-zinc-100 dark:bg-zinc-800
                   shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]
                   dark:shadow-[20px_20px_60px_#1a1a1a,-20px_-20px_60px_#2a2a2a]
                   flex items-center justify-between
                   -ml-[100px]"
      >
        {/* 左侧：标题和图标 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-lime-100 dark:bg-lime-900/30">
            <UsersIcon className="h-5 w-5 text-lime-600 dark:text-lime-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Community</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">社区成员</span>
          </div>
        </div>

        {/* 右侧：真实头像 + 固定25 */}
        <ClerkUserStats
          fallback={
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <div className="h-4 w-20 animate-pulse rounded bg-zinc-300 dark:bg-zinc-600" />
            </div>
          }
          render={(users) => {
            const realCount = Math.min(users.length, 4)
            const simCount = 4 - realCount

            return (
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {/* 真实用户在前 */}
                  {users.slice(0, 4).map((user, index) => (
                    <UserAvatar key={user.id} user={user} zIndex={4 - index} />
                  ))}
                  {/* 模拟用户补齐 */}
                  {SIMULATED_USERS.slice(0, simCount).map((sim, i) => (
                    <SimulatedAvatar key={sim.name} name={sim.name} gradient={sim.gradient} zIndex={4 - realCount - i} />
                  ))}
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800 bg-zinc-200 dark:bg-zinc-700 shrink-0">
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                      +{FIXED_MEMBERS - 4}
                    </span>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    {FIXED_MEMBERS}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    members
                  </span>
                </div>
              </div>
            )
          }}
        />
      </motion.div>

      {/* 卡片二：跳动单词 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 relative rounded-[30px] px-8 py-5
                   bg-zinc-100 dark:bg-zinc-800
                   shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]
                   dark:shadow-[20px_20px_60px_#1a1a1a,-20px_-20px_60px_#2a2a2a]
                   flex items-center justify-center gap-3"
      >
        <span className="text-zinc-500 dark:text-zinc-400 text-base font-medium whitespace-nowrap">Make it</span>
        <TextRotate
          texts={[
            'happen',
            'right',
            'fast',
          ]}
          mainClassName="text-white px-4 py-2 bg-gradient-to-r from-lime-500 to-emerald-500 overflow-hidden justify-center rounded-xl font-semibold inline-flex items-center text-base whitespace-nowrap"
          staggerFrom="last"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-120%' }}
          staggerDuration={0.025}
          splitLevelClassName="overflow-hidden inline-block"
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          rotationInterval={2000}
        />
      </motion.div>
    </div>
  )
}