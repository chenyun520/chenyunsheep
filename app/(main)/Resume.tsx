'use client'

import { motion } from 'framer-motion'
import React from 'react'

import { BriefcaseIcon, GraduationCapIcon } from '~/assets'

export function Resume() {
  return (
    <motion.div
      className="rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-50 dark:from-lime-900/20 dark:to-emerald-900/20 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        个人履历
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 p-1.5 rounded-lg bg-lime-100 dark:bg-lime-900/40">
            <GraduationCapIcon className="w-4 h-4 text-lime-600 dark:text-lime-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              陈云
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              湖南科技大学
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <BriefcaseIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              宁波得力集团
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              精益工程师
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-200/50 dark:border-zinc-700/50">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            专注精益工程，善于将复杂问题简单化，提升工作效率
          </p>
        </div>
      </div>
    </motion.div>
  )
}
