import React from 'react'

import { PresentationIcon } from '~/assets'
import { Container } from '~/components/ui/Container'

export default function TrainingPage() {
  const trainings = [
    {
      id: 'production-site-management',
      title: '生产现场日常管理',
      description: '系统性讲解生产现场管理的核心要点，包括5S管理、目视化管理、持续改善等内容',
      icon: '🎯',
      link: '/lean-academy-presentation.html',
      badge: '热门',
    },
  ]

  return (
    <Container className="mt-12 md:mt-16">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          培训课程
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          分享精益生产与现场管理的实战经验
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainings.map((training) => (
          <a
            key={training.id}
            href={training.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-[30px] overflow-hidden
                       bg-gradient-to-br from-lime-400 to-emerald-500
                       p-6 md:p-8
                       shadow-[rgba(5,71,17,0.1)_10px_15px_15px_-10px,rgba(5,71,17,0.05)_0px_10px_10px_0px]
                       transition-all duration-300
                       hover:shadow-[rgba(5,71,17,0.2)_15px_20px_20px_-10px,rgba(5,71,17,0.1)_0px_15px_15px_0px]
                       hover:scale-[1.02]"
          >
            {/* Badge */}
            {training.badge && (
              <div className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                {training.badge}
              </div>
            )}

            {/* Icon */}
            <div className="mb-4 text-5xl">{training.icon}</div>

            {/* Content */}
            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              {training.title}
            </h2>
            <p className="text-sm text-zinc-800/80 mb-4">
              {training.description}
            </p>

            {/* Action */}
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <PresentationIcon className="h-5 w-5" />
              <span>查看培训材料</span>
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            {/* Decorative circles */}
            <div className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white/20" />
            <div className="absolute bottom-1 right-4 w-4 h-4 rounded-full bg-white/10" />
          </a>
        ))}
      </div>

      {/* 更多课程提示 */}
      <div className="mt-12 text-center text-zinc-500 dark:text-zinc-400">
        <p>更多培训课程正在准备中...</p>
      </div>
    </Container>
  )
}
