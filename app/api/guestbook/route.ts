import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { emailConfig } from '~/config/email'
import { db } from '~/db'
import { type GuestbookDto, GuestbookHashids } from '~/db/dto/guestbook.dto'
import { fetchGuestbookMessages } from '~/db/queries/guestbook'
import { guestbook } from '~/db/schema'
import NewGuestbookEmail from '~/emails/NewGuestbook'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { resend } from '~/lib/mail'
import { redis } from '~/lib/redis'

function getKey(id?: string) {
  return `guestbook${id ? `:${id}` : ''}`
}

async function safeRatelimit(limitKey: string) {
  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '10 s'),
      analytics: false,
    })
    const result = await ratelimit.limit(limitKey)
    return { success: result.success, remaining: result.remaining, reset: result.reset }
  } catch {
    return { success: true, remaining: 999, reset: Date.now() + 10000 }
  }
}

export async function GET(req: NextRequest) {
  try {
    const { success, reset } = await safeRatelimit(getKey(req.ip ?? ''))
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests', retryAfter: reset },
        { status: 429 }
      )
    }

    const messages = await fetchGuestbookMessages()
    return NextResponse.json(messages)
  } catch (error) {
    console.error('[guestbook][GET] Database error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

const SignGuestbookSchema = z.object({
  message: z.string().min(1).max(600),
})

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req)

  if (!userId) {
    return NextResponse.json(
      { error: '登录已过期，请重新登录后留下评论', code: 'AUTH_EXPIRED' },
      { status: 401 }
    )
  }

  const { success, reset } = await safeRatelimit(getKey(userId))
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests', retryAfter: reset },
      { status: 429 }
    )
  }

  try {
    const data = await req.json()
    const parseResult = SignGuestbookSchema.safeParse(data)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const { message } = parseResult.data
    const user = await clerkClient.users.getUser(userId)

    const guestbookData = {
      userId,
      message,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      },
    }

    if (env.NODE_ENV === 'production' && env.SITE_NOTIFICATION_EMAIL_TO) {
      try {
        await resend.emails.send({
          from: emailConfig.from,
          to: env.SITE_NOTIFICATION_EMAIL_TO,
          subject: '👋 有人刚刚在留言墙留言了',
          react: NewGuestbookEmail({
            link: url(`/guestbook`).href,
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userImageUrl: user.imageUrl,
            commentContent: message,
          }),
        })
      } catch (emailError) {
        console.error('[guestbook][POST] Email send error:', emailError)
      }
    }

    const [newGuestbook] = await db
      .insert(guestbook)
      .values(guestbookData)
      .returning({
        newId: guestbook.id,
      })

    return NextResponse.json(
      {
        ...guestbookData,
        id: GuestbookHashids.encode(newGuestbook.newId),
        createdAt: new Date(),
      } satisfies GuestbookDto,
      { status: 201 }
    )
  } catch (error) {
    console.error('[guestbook][POST] Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
