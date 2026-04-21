import Image from 'next/image'

import { Container } from '~/components/ui/Container'

export const metadata = {
  title: '关于我 | Chenyun',
  description:
    '精益工程师、全栈开发者、UI/UX 设计师。热爱技术、设计与持续改善。',
}

export default function AboutPage() {
  return (
    <Container className="mt-16 sm:mt-24">
      <div className="max-w-2xl mx-auto">
        {/* 头像和标题 */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
          <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 p-[3px]">
            <div className="h-full w-full rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              <Image
                src="/个人形象.jpg"
                alt="Chenyun"
                width={128}
                height={128}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              陈云
            </h1>
            <p className="mt-2 text-lg text-lime-600 dark:text-lime-400 font-medium">
              chenyun-sheep
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              精益工程师 / 全栈开发者 / 设计师
            </p>
          </div>
        </div>

        {/* 简介 */}
        <div className="space-y-6 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          <p>
            你好！我是 Chenyun，一位热爱技术、设计和持续改善的精益工程师。
            我相信<span className="text-zinc-800 dark:text-zinc-200 font-medium">好产品源自对细节的极致追求</span>。
          </p>
          <p>
            我目前专注于全栈开发（React / Next.js / Node.js）、UI/UX 设计，
            以及精益生产在企业数字化转型中的实践。我善于将复杂问题简单化，用技术手段提升工作效率。
          </p>
          <p>
            工作之余，我喜欢写技术博客分享知识，探索 AI 工具的无限可能，
            以及研究如何将精益思维应用到软件开发流程中。
          </p>
        </div>

        {/* 技能标签 */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
            技能 & 工具
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              'React', 'Next.js', 'TypeScript', 'Node.js',
              'Tailwind CSS', 'PostgreSQL', 'Sanity CMS',
              'UI/UX Design', 'Figma', '精益生产', '6S管理',
              'MES系统', 'SAP', 'Claude AI', 'Python',
            ].map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                           bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200
                           dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* 教育和经历 */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-4">
            经历
          </h2>
          <div className="space-y-4">
            {[
              {
                title: '精益工程师',
                org: '宁波得力集团',
                period: '在职',
                desc: '负责精益生产推进、MES 系统开发与运维、现场改善和培训课程开发',
              },
              {
                title: '全栈开发者 & 设计师',
                org: '独立项目',
                period: '持续中',
                desc: '开发个人品牌网站、企业级定制系统、AI 工具应用等',
              },
              {
                title: '理学学士',
                org: '湖南科技大学',
                period: '已毕业',
                desc: '',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-700 pb-4"
              >
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-lime-500" />
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {item.title}
                  </h3>
                  <span className="text-xs text-zinc-500 shrink-0">{item.period}</span>
                </div>
                <p className="text-xs text-lime-600 dark:text-lime-400 font-medium">
                  {item.org}
                </p>
                {item.desc && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 联系方式 */}
        <div className="mt-10 mb-16 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            想和我聊聊？
          </p>
          <a
            href="https://order.cherishbloom.top/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                       bg-gradient-to-r from-lime-400 to-emerald-500
                       text-sm font-semibold text-zinc-900
                       hover:shadow-lg hover:shadow-lime-500/25
                       transition-all active:scale-95"
          >
            预约咨询
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </Container>
  )
}
