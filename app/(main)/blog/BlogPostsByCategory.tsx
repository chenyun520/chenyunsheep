import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { redis } from '~/lib/redis'
import {
  getBlogPostsByCategory,
  getLatestBlogPosts,
  searchBlogPosts,
} from '~/sanity/queries'

import { BlogPostCard } from './BlogPostCard'

export async function BlogPostsByCategory({
  selectedCategory,
  searchQuery,
  limit = 20,
}: {
  selectedCategory?: string | null
  searchQuery?: string | null
  limit?: number
}) {
  // 搜索优先
  let posts
  if (searchQuery) {
    posts = await searchBlogPosts(searchQuery, limit)
  } else if (selectedCategory) {
    posts = await getBlogPostsByCategory(selectedCategory, limit)
  } else {
    posts = await getLatestBlogPosts({ limit, forDisplay: true })
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
        <p className="text-lg">{searchQuery ? '没有找到相关文章' : '暂无文章'}</p>
        <p className="mt-2 text-sm">
          {searchQuery
            ? `未找到与"${searchQuery}"相关的文章，试试其他关键词`
            : '该分类下还没有发布任何文章'}
        </p>
      </div>
    )
  }

  const postIdKeys = posts.map(({ _id }) => kvKeys.postViews(_id))

  let views: number[] = []
  if (env.VERCEL_ENV === 'development') {
    views = posts.map(() => Math.floor(Math.random() * 1000))
  } else {
    if (postIdKeys.length > 0) {
      views = await redis.mget<number[]>(...postIdKeys)
    }
  }

  return (
    <>
      {posts.map((post, idx) => (
        <BlogPostCard post={post} views={views[idx] ?? 0} key={post._id} />
      ))}
    </>
  )
}
