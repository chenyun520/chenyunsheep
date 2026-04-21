'use client'

import React from 'react'

// 3D 卡片组件
function Card3D({
  title,
  description,
  items,
  price,
  buttonText,
  buttonHref,
  accentColor = 'from-lime-400 to-emerald-500',
}: {
  title: string
  description: string
  items: string[]
  price?: string
  buttonText: string
  buttonHref: string
  accentColor?: string
}) {
  return (
    <div className="group relative" style={{ perspective: 1000 }}>
      <div
        className={`relative h-full rounded-[50px] overflow-hidden
                     bg-gradient-to-br ${accentColor}
                     shadow-[rgba(5,71,17,0)_40px_50px_25px_-40px,rgba(5,71,17,0.2)_0px_25px_25px_-5px]
                     transition-all duration-500
                     hover:shadow-[rgba(5,71,17,0.3)_30px_50px_25px_-40px,rgba(5,71,17,0.1)_0px_25px_30px_0px]
                     hover:rotate-3`}
      >
        {/* Glass layer */}
        <div
          className="absolute inset-2 rounded-[55px] rounded-tr-[100%]
                       bg-gradient-to-b from-white/80 via-white/60 to-white/30
                       dark:from-zinc-900/80 dark:via-zinc-900/60 dark:to-zinc-900/30
                       border-l border-b border-white/50 dark:border-white/10"
        />

        {/* Decorative circles */}
        <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm" />
        <div className="absolute top-5 right-5 w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm" />
        <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative p-8 h-full flex flex-col">
          {/* 标题 */}
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            {title}
          </h3>

          {/* 描述 */}
          <p className="text-sm text-zinc-700/80 dark:text-zinc-300/80 leading-relaxed mb-4">
            {description}
          </p>

          {/* 项目列表 */}
          <ul className="flex-grow space-y-2 mb-6">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg className="h-5 w-5 text-lime-600 dark:text-lime-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* 价格 */}
          {price && (
            <div className="mb-4 text-center">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {price}
              </span>
            </div>
          )}

          {/* 按钮 */}
          <a
            href={buttonHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3
                       text-white uppercase cursor-pointer
                       border-2 border-black
                       font-semibold text-sm
                       bg-yellow-400
                       rounded-[50px]
                       relative overflow-hidden
                       transition-all duration-500
                       hover:shadow-lg
                       active:scale-95
                       group/btn"
          >
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 36 36"
              width="24px"
              height="24px"
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

// 装饰按钮组件
function DecorativeButton() {
  return (
    <div className="button-wrap">
      <div className="button-shadow" />
      <button className="button" type="button">
        <span className="span">Let&apos;s Talk</span>
      </button>
    </div>
  )
}

// 邮箱复制按钮组件
function EmailCopyButton({ email }: { email: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200
                 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all active:scale-95 relative"
      title="复制邮箱"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          邮箱已复制!
        </span>
      )}
    </button>
  )
}

// 手机号复制按钮组件
function PhoneCopyButton({ phone }: { phone: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(phone).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200
                 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all active:scale-95 relative"
      title="复制手机号"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          手机号已复制!
        </span>
      )}
    </button>
  )
}

export function AmaClient() {
  return (
    <>
      {/* 两大模块 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* 模块一：一对一咨询 */}
        <Card3D
          title="一对一咨询"
          description="我可以为你解答以下相关的问题，帮助你解决技术难题和职业发展困惑："
          items={[
            '前端/全栈开发：工作难找、职场建议、技术提升',
            'UI/UX 设计：如何开始学习设计、提升设计水平',
            '精益课程：《目视化管理》、《八大浪费》等系列课程',
            '英语技能：英语学习方法、考试技巧',
            'MES/SAP 系统开发运维相关咨询',
          ]}
          price="¥150/30分钟 · ¥300/60分钟"
          buttonText="立即预约咨询"
          buttonHref="https://order.cherishbloom.top/"
          accentColor="from-lime-400 to-emerald-500"
        />

        {/* 模块二：定制软件系统开发 */}
        <Card3D
          title="定制软件系统开发"
          description="提供专业的定制软件开发服务，从需求分析到上线部署，全程跟进："
          items={[
            '企业级 MES 系统定制开发',
            'SAP 系统集成与二次开发',
            'Web 应用开发（React/Next.js/Vue）',
            '移动端应用开发',
            'UI/UX 设计与交互优化',
            '系统运维与技术支持',
          ]}
          price="根据项目需求报价"
          buttonText="联系了解详情"
          buttonHref="https://order.cherishbloom.top/"
          accentColor="from-cyan-400 to-blue-500"
        />
      </div>

      {/* 联系方式卡片 */}
      <div className="mt-16 max-w-3xl mx-auto">
        <div
          className="relative rounded-[50px] overflow-hidden
                     bg-gradient-to-br from-violet-400 to-purple-500
                     shadow-[rgba(76,29,149,0.1)_10px_15px_15px_-10px,rgba(76,29,149,0.05)_0px_10px_10px_0px]"
        >
          {/* Glass layer */}
          <div className="absolute inset-2 rounded-[46px] rounded-tr-[80%]
                          bg-gradient-to-b from-white/80 via-white/60 to-white/40
                          border-l border-b border-white/50" />

          {/* Decorative circles */}
          <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm" />
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm" />
          <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm" />

          <div className="relative p-8">
            {/* 装饰按钮 */}
            <div className="flex justify-center mb-6">
              <a href="https://order.cherishbloom.top/" target="_blank" rel="noopener noreferrer">
                <DecorativeButton />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://order.cherishbloom.top/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                           bg-blue-500 text-white font-medium
                           hover:bg-blue-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                立即下单
              </a>

              <PhoneCopyButton phone="17807368897" />

              <EmailCopyButton email="gaolujie26@gmail.com" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}