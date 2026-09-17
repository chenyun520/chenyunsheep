import { Suspense } from 'react'
import Balancer from 'react-wrap-balancer'

import { BreathingText } from '~/components/fancy/text/breathing-text'
import { Container } from '~/components/ui/Container'
import { getAllCategories } from '~/sanity/queries'

import { BlogCategories } from './BlogCategories'
import { BlogPostsByCategory } from './BlogPostsByCategory'
import { BlogSearch } from './BlogSearch'

const description =
  '写博客文章是我比较喜欢的沉淀分享方式，我希望能够把好用的技术知识传递给更多的人。我比较喜欢围绕着技术为主的话题，但是也会写一些非技术的话题，比如设计、创业、游戏分享、生活随笔等等。'
export const metadata = {
  title: '我的博客',
  description,
  openGraph: {
    title: '我的博客',
    description,
  },
  twitter: {
    title: '我的博客',
    description,
    card: 'summary_large_image',
  },
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams
  const categories = await getAllCategories()
  const selectedCategory = params.category
  const searchQuery = params.q

  return (
    <Container className="mt-16 sm:mt-24">
      <header className="max-w-2xl">
        {/* 呼吸动画标题 */}
        <div className="mb-8">
          <BreathingText
            staggerDuration={0.1}
            fromFontVariationSettings="'wght' 300, 'slnt' 0"
            toFontVariationSettings="'wght' 700, 'slnt' -5"
            className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl leading-tight"
          >
            欢迎光临我的博客
          </BreathingText>
        </div>

        <p className="my-6 text-base text-zinc-600 dark:text-zinc-400">
          <Balancer>{description}</Balancer>
        </p>
      </header>

      <section
        aria-label="文章搜索与分类"
        className="mt-10 rounded-3xl border border-zinc-200/80 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-7"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="shrink-0">
            <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
              探索文章
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              找到你感兴趣的内容
            </p>
          </div>
          <div className="w-full sm:max-w-md">
            <Suspense fallback={<div className="h-12" />}>
              <BlogSearch />
            </Suspense>
          </div>
        </div>

        {!searchQuery && (
          <div className="mt-6 border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <p className="mb-3 text-xs font-medium tracking-wider text-zinc-500 dark:text-zinc-400">
              文章分类
            </p>
            <Suspense fallback={<div className="h-11" />}>
              <BlogCategories categories={categories} />
            </Suspense>
          </div>
        )}
      </section>

      {/* 博客文章列表 */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 lg:grid-cols-2 lg:gap-8">
        <Suspense fallback={<div>加载中...</div>}>
          <BlogPostsByCategory
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            limit={20}
          />
        </Suspense>
      </div>
    </Container>
  )
}

export const revalidate = 60
