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
import {
  buildGuestIdentity,
  GuestNicknameSchema,
  isReservedNickname,
} from '~/lib/guest'
import { normalizeIpForRateLimit } from '~/lib/ip'
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

// 游客按 IP 限流（5 次 / 600 秒），比登录用户更严格
async function safeGuestCommentRatelimit(ip: string) {
  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '600 s'),
      analytics: false,
    })
    const result = await ratelimit.limit(`comments:guest:${ip}`)
    return { success: result.success, reset: result.reset }
  } catch {
    return { success: true, reset: Date.now() + 600000 }
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
  nickname: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: Params) {
  const { userId: clerkUserId } = getAuth(req)

  const postId = params.id

  if (!clerkUserId) {
    // 游客按 IP 更严限流；登录用户沿用原限流
    const guestRate = await safeGuestCommentRatelimit(
      normalizeIpForRateLimit(req.ip ?? 'unknown')
    )
    if (!guestRate.success) {
      return NextResponse.json(
        { error: '评论太频繁啦，稍后再试', retryAfter: guestRate.reset },
        { status: 429 }
      )
    }
  } else {
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
  }

  const post = await client.fetch<
    { slug: string; title: string; imageUrl: string } | undefined
  >(
    '*[_type == "post" && _id == $id][0]{ "slug": slug.current, title, "imageUrl": mainImage.asset->url }',
    { id: postId }
  )

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 412 })
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

    const { body, parentId: hashedParentId, nickname } = parseResult.data
    const [parentId] = CommentHashids.decode(hashedParentId ?? '')

    let userId: string
    let userInfo: {
      firstName: string | null
      lastName: string | null
      imageUrl: string | null
    }
    if (clerkUserId) {
      // 登录用户：只调用一次 Clerk API 获取用户信息
      const user = await clerkClient.users.getUser(clerkUserId)
      userId = user.id
      userInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl || null,
      }
    } else {
      // 游客：校验昵称后生成稳定身份
      const nicknameCheck = GuestNicknameSchema.safeParse(nickname ?? '')
      if (!nicknameCheck.success) {
        return NextResponse.json(
          { error: '请先填写昵称（1-20 个字符）' },
          { status: 400 }
        )
      }
      if (isReservedNickname(nicknameCheck.data)) {
        return NextResponse.json(
          { error: '这个昵称是站长专属，换一个吧' },
          { status: 400 }
        )
      }
      const guest = buildGuestIdentity(nicknameCheck.data)
      userId = guest.userId
      userInfo = guest.userInfo
    }

    const commentData = {
      postId,
      userId,
      body,
      userInfo,
      parentId: parentId ? (parentId as number) : null,
    }

    if (
      parentId &&
      env.NODE_ENV === 'production' &&
      env.SITE_NOTIFICATION_EMAIL_TO
    ) {
      try {
        const [parentUserFromDb] = await db
          .select({
            userId: comments.userId,
          })
          .from(comments)
          .where(eq(comments.id, parentId as number))

        if (parentUserFromDb?.userId.startsWith('guest:')) {
          // 父评论是游客留言，无邮箱可通知，跳过
        } else if (parentUserFromDb && parentUserFromDb.userId !== userId) {
          const { primaryEmailAddressId, emailAddresses } =
            await clerkClient.users.getUser(parentUserFromDb.userId)
          const primaryEmailAddress = emailAddresses.find(
            (emailAddress) => emailAddress.id === primaryEmailAddressId
          )

          if (primaryEmailAddress) {
            // 每条父评论每小时最多发一封回复通知，防止匿名刷回复轰炸被回复者邮箱
            const cooldownKey = `comments:replymail:${parentId}`
            let shouldSendMail = true
            try {
              const acquired = await redis.set(cooldownKey, '1', {
                nx: true,
                ex: 3600,
              })
              shouldSendMail = acquired === 'OK'
            } catch {
              shouldSendMail = true // Redis 故障时放行，与站内限流失败策略一致
            }

            if (shouldSendMail) {
              await resend.emails.send({
                from: emailConfig.from,
                to: primaryEmailAddress.emailAddress,
                subject: '👋 有人回复了你的评论',
                react: NewReplyCommentEmail({
                  postTitle: post.title,
                  postLink: url(`/blog/${post.slug}`).href,
                  postImageUrl: post.imageUrl,
                  userFirstName: userInfo.firstName ?? '游客',
                  userLastName: userInfo.lastName ?? null,
                  userImageUrl: userInfo.imageUrl ?? undefined,
                  commentContent: body.text,
                }),
              })
            }
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
