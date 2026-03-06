import { Suspense } from 'react'
import Balancer from 'react-wrap-balancer'

import { BreathingText } from '~/components/fancy/text/breathing-text'
import { Container } from '~/components/ui/Container'
import { getAllCategories } from '~/sanity/queries'

import { BlogCategories } from './BlogCategories'
import { BlogPostsByCategory } from './BlogPostsByCategory'

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
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const categories = await getAllCategories()
  const selectedCategory = params.category

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

      {/* 分类筛选器 */}
      <Suspense fallback={<div className="h-20" />}>
        <BlogCategories categories={categories} />
      </Suspense>

      {/* 博客文章列表 */}
      <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-20 lg:grid-cols-2 lg:gap-8">
        <Suspense fallback={<div>加载中...</div>}>
          <BlogPostsByCategory
            selectedCategory={selectedCategory}
            limit={20}
          />
        </Suspense>
      </div>
    </Container>
  )
}

export const revalidate = 60
