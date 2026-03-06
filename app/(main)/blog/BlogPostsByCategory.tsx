import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { redis } from '~/lib/redis'
import {
  getBlogPostsByCategory,
  getLatestBlogPosts,
} from '~/sanity/queries'

import { BlogPostCard } from './BlogPostCard'

export async function BlogPostsByCategory({
  selectedCategory,
  limit = 20,
}: {
  selectedCategory?: string | null
  limit?: number
}) {
  // 根据是否选择分类来获取文章
  const posts = selectedCategory
    ? await getBlogPostsByCategory(selectedCategory, limit)
    : await getLatestBlogPosts({ limit, forDisplay: true })

  if (!posts || posts.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-zinc-500 dark:text-zinc-400">
        <p className="text-lg">暂无文章</p>
        <p className="mt-2 text-sm">该分类下还没有发布任何文章</p>
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
