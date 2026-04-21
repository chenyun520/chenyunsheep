import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { asc, eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { emailConfig } from '~/config/email'
import { db } from '~/db'
import {
  type CommentDto,
  CommentHashids,
  type PostIDLessCommentDto,
} from '~/db/dto/comment.dto'
import { comments } from '~/db/schema'
import NewReplyCommentEmail from '~/emails/NewReplyComment'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { resend } from '~/lib/mail'
import { redis } from '~/lib/redis'
import { client } from '~/sanity/lib/client'

function getKey(id: string) {
  return `comments:${id}`
}

type RatelimitResult = { success: boolean; remaining: number; reset: number }

async function safeRatelimit(limitKey: string): Promise<RatelimitResult> {
  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: false,
    })
    const result = await ratelimit.limit(limitKey)
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch {
    return { success: true, remaining: 999, reset: Date.now() + 10000 }
  }
}

type Params = { params: { id: string } }
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const postId = params.id

    const { success, remaining, reset } = await safeRatelimit(
      getKey(postId) + `_${req.ip ?? ''}`
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests', retryAfter: reset },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    const data = await db
      .select({
        id: comments.id,
        userId: comments.userId,
        userInfo: comments.userInfo,
        body: comments.body,
        createdAt: comments.createdAt,
        parentId: comments.parentId,
      })
      .from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt))

    const result = data.map(
      ({ id, parentId, ...rest }) =>
        ({
          ...rest,
          id: CommentHashids.encode(id),
          parentId: parentId ? CommentHashids.encode(parentId) : null,
        }) as PostIDLessCommentDto
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('[comments][GET] Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

const CreateCommentSchema = z.object({
  body: z.object({
    blockId: z.string().optional(),
    text: z.string().min(1).max(999),
  }),
  parentId: z.string().nullable().optional(),
})

export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json(
      { error: '登录已过期，请重新登录后留下评论', code: 'AUTH_EXPIRED' },
      { status: 401 }
    )
  }

  const postId = params.id

  const { success, remaining, reset } = await safeRatelimit(getKey(postId) + `_${req.ip ?? ''}`)
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests', retryAfter: reset },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  const post = await client.fetch<
    { slug: string; title: string; imageUrl: string } | undefined
  >(
    '*[_type == "post" && _id == $id][0]{ "slug": slug.current, title, "imageUrl": mainImage.asset->url }',
    { id: postId }
  )

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 412 }
    )
  }

  try {
    const data = await req.json()
    const parseResult = CreateCommentSchema.safeParse(data)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const { body, parentId: hashedParentId } = parseResult.data
    const [parentId] = CommentHashids.decode(hashedParentId ?? '')

    // 只调用一次 Clerk API 获取用户信息
    const user = await clerkClient.users.getUser(userId)
    const commentData = {
      postId,
      userId: user.id,
      body,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl || null,
      },
      parentId: parentId ? (parentId as number) : null,
    }

    if (parentId && env.NODE_ENV === 'production' && env.SITE_NOTIFICATION_EMAIL_TO) {
      try {
        const [parentUserFromDb] = await db
          .select({
            userId: comments.userId,
          })
          .from(comments)
          .where(eq(comments.id, parentId as number))

        if (parentUserFromDb && parentUserFromDb.userId !== userId) {
          const { primaryEmailAddressId, emailAddresses } =
            await clerkClient.users.getUser(parentUserFromDb.userId)
          const primaryEmailAddress = emailAddresses.find(
            (emailAddress) => emailAddress.id === primaryEmailAddressId
          )

          if (primaryEmailAddress) {
            await resend.emails.send({
              from: emailConfig.from,
              to: primaryEmailAddress.emailAddress,
              subject: '👋 有人回复了你的评论',
              react: NewReplyCommentEmail({
                postTitle: post.title,
                postLink: url(`/blog/${post.slug}`).href,
                postImageUrl: post.imageUrl,
                userFirstName: user.firstName,
                userLastName: user.lastName,
                userImageUrl: user.imageUrl || undefined,
                commentContent: body.text,
              }),
            })
          }
        }
      } catch (emailError) {
        console.error('[comments][POST] Email send error:', emailError)
      }
    }

    const [newComment] = await db
      .insert(comments)
      .values(commentData)
      .returning({
        newId: comments.id,
      })

    return NextResponse.json(
      {
        ...commentData,
        id: CommentHashids.encode(newComment.newId),
        createdAt: new Date(),
        parentId: hashedParentId,
      } satisfies CommentDto,
      { status: 201 }
    )
  } catch (error) {
    console.error('[comments][POST] Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
