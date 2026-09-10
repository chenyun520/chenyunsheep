import { type Metadata } from 'next'
import React from 'react'

import { PresentationIcon } from '~/assets'
import { Container } from '~/components/ui/Container'

import { ReportsSection } from './ReportsSection'

const title = '培训课程'
const description =
  '分享精益生产与现场管理的实战经验：生产现场日常管理、精益6S管理培训课件，以及课件开发与课程培训服务。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata

function ServiceCard3D({
  title,
  items,
  price,
  buttonText,
  accentColor = 'from-amber-400 to-orange-500',
}: {
  title: string
  items: { name: string; price: string }[]
  price?: string
  buttonText: string
  accentColor?: string
}) {
  return (
    <div className="group relative" style={{ perspective: 1000 }}>
      <div
        className={`relative h-full rounded-[40px] overflow-hidden
                     bg-gradient-to-br ${accentColor}
                     shadow-[rgba(5,71,17,0)_40px_50px_25px_-40px,rgba(5,71,17,0.2)_0px_25px_25px_-5px]
                     transition-all duration-500
                     hover:shadow-[rgba(5,71,17,0.3)_30px_50px_25px_-40px,rgba(5,71,17,0.1)_0px_25px_30px_0px]
                     hover:rotate-3`}
      >
        <div
          className="absolute inset-2 rounded-[35px] rounded-tr-[80%]
                       bg-gradient-to-b from-white/80 via-white/60 to-white/30
                       dark:from-zinc-900/80 dark:via-zinc-900/60 dark:to-zinc-900/30
                       border-l border-b border-white/50 dark:border-white/10"
        />

        <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm" />
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm" />
        <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm" />

        <div className="relative p-6 h-full flex flex-col">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {title}
          </h3>

          <ul className="flex-grow space-y-3 mb-4">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between items-center text-sm text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item.name}
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {item.price}
                </span>
              </li>
            ))}
          </ul>

          {price && (
            <div className="mb-4 text-center py-2 bg-white/30 dark:bg-zinc-900/30 rounded-xl">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {price}
              </span>
            </div>
          )}

          <a
            href="https://t.me/+6048587342"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5
                       text-white uppercase cursor-pointer
                       border-2 border-black
                       font-semibold text-xs
                       bg-yellow-400
                       rounded-[50px]
                       relative overflow-hidden
                       transition-all duration-500
                       hover:shadow-lg
                       active:scale-95
                       group/btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 36 36"
              width="20px"
              height="20px"
              className="transition-transform duration-500 group-hover/btn:scale-150 group-hover/btn:translate-x-2"
            >
              <rect width={36} height={36} x={0} y={0} fill="#fdd835" />
              <path
                fill="#e53935"
                d="M38.67,42H11.52C11.27,40.62,11,38.57,11,36c0-5,0-11,0-11s1.44-7.39,3.22-9.59 c1.67-2.06,2.76-3.48,6.78-4.41c3-0.7,7.13-0.23,9,1c2.15,1.42,3.37,6.67,3.81,11.29c1.49-0.3,5.21,0.2,5.5,1.28 C40.89,30.29,39.48,38.31,38.67,42z"
              />
            </svg>
            <span className="transition-all duration-500 group-hover/btn:translate-x-4">
              {buttonText}
            </span>
            <span className="absolute left-2 -translate-x-12 opacity-0 transition-all duration-500 group-hover/btn:translate-x-0 group-hover/btn:opacity-100">
              GO!
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function TrainingPage() {
  const trainings = [
    {
      id: 'production-site-management',
      title: '生产现场日常管理培训',
      description: '系统性讲解生产现场管理的核心要点，包括5S管理、目视化管理、持续改善等内容',
      icon: '🎯',
      link: '/production-training.html',
      badge: '热门',
    },
    {
      id: '6s-management',
      title: '精益6S管理培训',
      description: '6S管理是企业现场管理的基石，包括整理、整顿、清扫、清洁、素养、安全六大核心要素',
      icon: '🏭',
      link: '/6s-training.html',
      badge: '推荐',
    },
  ]

  const services = [
    {
      title: '课件开发服务',
      items: [
        { name: '课件代开发', price: '¥10/页' },
        { name: 'HTML可视化报告', price: '¥15/页' },
      ],
      price: '专业定制，质量保证',
      buttonText: '咨询报价',
      accentColor: 'from-amber-400 to-orange-500',
    },
    {
      title: '培训课程服务',
      items: [
        { name: '现场课程培训', price: '¥2000/4小时' },
        { name: '线上课程培训', price: '¥1000/4小时' },
      ],
      price: '小班授课，因材施教',
      buttonText: '预约培训',
      accentColor: 'from-emerald-400 to-teal-500',
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
            {training.badge && (
              <div className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white">
                {training.badge}
              </div>
            )}

            <div className="mb-4 text-5xl">{training.icon}</div>

            <h2 className="text-xl font-bold text-zinc-900 mb-2">
              {training.title}
            </h2>
            <p className="text-sm text-zinc-800/80 mb-4">
              {training.description}
            </p>

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

            <div className="absolute top-1 right-1 w-8 h-8 rounded-full bg-white/20" />
            <div className="absolute bottom-1 right-4 w-4 h-4 rounded-full bg-white/10" />
          </a>
        ))}
      </div>

      <ReportsSection />

      {/* 服务广告模块 */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8 text-center">
          📋 专业服务
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {services.map((service, index) => (
            <ServiceCard3D
              key={index}
              title={service.title}
              items={service.items}
              price={service.price}
              buttonText={service.buttonText}
              accentColor={service.accentColor}
            />
          ))}
        </div>
      </section>

      <div className="mt-12 text-center text-zinc-500 dark:text-zinc-400">
        <p>更多培训课程正在准备中...</p>
      </div>
    </Container>
  )
}
