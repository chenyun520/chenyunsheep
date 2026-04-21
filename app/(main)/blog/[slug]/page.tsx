import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { redis } from '~/lib/redis'
import { getAllLatestBlogPostSlugs, getBlogPost } from '~/sanity/queries'

export async function generateStaticParams() {
  const slugs = await getAllLatestBlogPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const post = await getBlogPost(params.slug)
  if (!post || !post.mainImage?.asset?.url) {
    notFound()
  }

  const { title, description, mainImage } = post

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      type: 'article',
    },
    twitter: {
      images: [
        {
          url: mainImage.asset.url,
        },
      ],
      title,
      description,
      card: 'summary_large_image',
      site: '@chenyun_engineer',
      creator: '@chenyun_engineer',
    },
  } satisfies Metadata
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug)

  // 添加详细日志用于调试
  if (!post) {
    console.error('[BlogPage] Post not found for slug:', params.slug)
    notFound()
  }

  // 验证必要字段
  if (!post.mainImage?.asset?.url) {
    console.error('[BlogPage] Post missing mainImage:', post._id, post.title)
    notFound()
  }

  if (!post.body || post.body.length === 0) {
    console.error('[BlogPage] Post missing body content:', post._id, post.title)
    notFound()
  }

  let views: number
  if (env.VERCEL_ENV === 'production') {
    views = await redis.incr(kvKeys.postViews(post._id))
  } else {
    views = 30578
  }

  let reactions: number[] = [0, 0, 0, 0]
  try {
    const res = await fetch(url(`/api/reactions?id=${post._id}`), {
      cache: 'no-store',
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length === 4) {
        reactions = data
      }
    } else {
      console.warn('Reactions API returned non-ok status:', res.status)
    }
  } catch (error) {
    console.error('Failed to fetch reactions:', error)
  }

  let relatedViews: number[] = []
  if (typeof post.related !== 'undefined' && post.related.length > 0) {
    if (env.VERCEL_ENV === 'development') {
      relatedViews = post.related.map(() => Math.floor(Math.random() * 1000))
    } else {
      const postIdKeys = post.related.map(({ _id }) => kvKeys.postViews(_id))
      relatedViews = await redis.mget<number[]>(...postIdKeys)
    }
  }

  return (
    <BlogPostPage
      post={post}
      views={views}
      relatedViews={relatedViews}
      reactions={reactions}
    />
  )
}

export const revalidate = 60
