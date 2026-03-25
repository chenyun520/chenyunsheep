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

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
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
  } catch (error) {
    console.warn('[comments] Redis ratelimit error, allowing request:', error)
    return { success: true, remaining: 999, reset: Date.now() + 10000 }
  }
}

type Params = { params: { id: string } }
export async function GET(req: NextRequest, { params }: Params) {
  const requestId = generateRequestId()
  console.log(`[comments][GET][${requestId}] Starting request for postId:`, params.id)

  try {
    const postId = params.id

    const { success, remaining, reset } = await safeRatelimit(
      getKey(postId) + `_${req.ip ?? ''}`
    )

    if (!success) {
      console.log(`[comments][GET][${requestId}] Rate limit exceeded. Remaining:`, remaining, 'Reset:', reset)
      return NextResponse.json(
        { error: 'Too Many Requests', retryAfter: reset },
        {
          status: 429,
          headers: {
            'X-Request-Id': requestId,
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }

    console.log(`[comments][GET][${requestId}] Querying database for postId:`, postId)
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

    console.log(`[comments][GET][${requestId}] Found ${data.length} comments`)

    const result = data.map(
      ({ id, parentId, ...rest }) =>
        ({
          ...rest,
          id: CommentHashids.encode(id),
          parentId: parentId ? CommentHashids.encode(parentId) : null,
        }) as PostIDLessCommentDto
    )

    return NextResponse.json(result, {
      headers: {
        'X-Request-Id': requestId,
        'X-Comments-Count': result.length.toString(),
      },
    })
  } catch (error) {
    console.error(`[comments][GET][${requestId}] Database error:`, error)
    console.error(`[comments][GET][${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch comments', requestId },
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
  const requestId = generateRequestId()
  console.log(`[comments][POST][${requestId}] Starting request for postId:`, params.id)

  const { userId } = getAuth(req)

  if (!userId) {
    console.log(`[comments][POST][${requestId}] No userId from getAuth()`)
    return NextResponse.json(
      { error: 'Not authenticated', requestId },
      { status: 401 }
    )
  }

  console.log(`[comments][POST][${requestId}] User authenticated:`, userId)

  try {
    const user = await clerkClient.users.getUser(userId)
    console.log(`[comments][POST][${requestId}] Got user info:`, user.firstName, user.lastName)
  } catch (error) {
    console.error(`[comments][POST][${requestId}] Failed to get user from Clerk:`, error)
    return NextResponse.json(
      { error: 'Failed to get user information', requestId },
      { status: 500 }
    )
  }

  const postId = params.id
  console.log(`[comments][POST][${requestId}] Checking rate limit`)

  const { success, remaining, reset } = await safeRatelimit(getKey(postId) + `_${req.ip ?? ''}`)
  if (!success) {
    console.log(`[comments][POST][${requestId}] Rate limit exceeded`)
    return NextResponse.json(
      { error: 'Too Many Requests', retryAfter: reset, requestId },
      {
        status: 429,
        headers: {
          'X-Request-Id': requestId,
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }

  console.log(`[comments][POST][${requestId}] Fetching post from Sanity:`, postId)
  const post = await client.fetch<
    { slug: string; title: string; imageUrl: string } | undefined
  >(
    '*[_type == "post" && _id == $id][0]{ "slug": slug.current, title, "imageUrl": mainImage.asset->url }',
    {
      id: postId,
    }
  )

  if (!post) {
    console.log(`[comments][POST][${requestId}] Post not found in Sanity`)
    return NextResponse.json(
      { error: 'Post not found', requestId },
      { status: 412 }
    )
  }

  console.log(`[comments][POST][${requestId}] Post found:`, post.title)

  try {
    const data = await req.json()
    console.log(`[comments][POST][${requestId}] Parsing request body`)

    const parseResult = CreateCommentSchema.safeParse(data)
    if (!parseResult.success) {
      console.log(`[comments][POST][${requestId}] Validation error:`, parseResult.error)
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.errors, requestId },
        { status: 400 }
      )
    }

    const { body, parentId: hashedParentId } = parseResult.data
    const [parentId] = CommentHashids.decode(hashedParentId ?? '')

    console.log(`[comments][POST][${requestId}] Inserting comment into database`)

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
        console.log(`[comments][POST][${requestId}] Sending reply notification email`)
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
            console.log(`[comments][POST][${requestId}] Reply notification email sent`)
          }
        }
      } catch (emailError) {
        console.error(`[comments][POST][${requestId}] Email send error:`, emailError)
      }
    }

    const [newComment] = await db
      .insert(comments)
      .values(commentData)
      .returning({
        newId: comments.id,
      })

    console.log(`[comments][POST][${requestId}] Comment created successfully, id:`, newComment.newId)

    return NextResponse.json(
      {
        ...commentData,
        id: CommentHashids.encode(newComment.newId),
        createdAt: new Date(),
        parentId: hashedParentId,
      } satisfies CommentDto,
      {
        status: 201,
        headers: {
          'X-Request-Id': requestId,
        },
      }
    )
  } catch (error) {
    console.error(`[comments][POST][${requestId}] Error creating comment:`, error)
    console.error(`[comments][POST][${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to create comment', requestId },
      { status: 500 }
    )
  }
}
