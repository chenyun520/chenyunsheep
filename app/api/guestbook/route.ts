import { clerkClient, getAuth } from '@clerk/nextjs/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
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

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

function getKey(id?: string) {
  return `guestbook${id ? `:${id}` : ''}`
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

async function safeRatelimit(limitKey: string) {
  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '10 s'),
      analytics: false,
    })
    const result = await ratelimit.limit(limitKey)
    return { success: result.success, remaining: result.remaining, reset: result.reset }
  } catch (error) {
    console.warn('[guestbook] Redis ratelimit error, allowing request:', error)
    return { success: true, remaining: 999, reset: Date.now() + 10000 }
  }
}

export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  console.log(`[guestbook][GET][${requestId}] Starting request`)

  try {
    const { success, remaining, reset } = await safeRatelimit(getKey(req.ip ?? ''))
    if (!success) {
      console.log(`[guestbook][GET][${requestId}] Rate limit exceeded`)
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

    console.log(`[guestbook][GET][${requestId}] Fetching messages`)
    const messages = await fetchGuestbookMessages()
    console.log(`[guestbook][GET][${requestId}] Found ${messages.length} messages`)

    return NextResponse.json(messages, {
      headers: {
        'X-Request-Id': requestId,
        'X-Messages-Count': messages.length.toString(),
      },
    })
  } catch (error) {
    console.error(`[guestbook][GET][${requestId}] Database error:`, error)
    console.error(`[guestbook][GET][${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to fetch messages', requestId },
      { status: 500 }
    )
  }
}

const SignGuestbookSchema = z.object({
  message: z.string().min(1).max(600),
})

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  console.log(`[guestbook][POST][${requestId}] Starting request`)

  const { userId } = getAuth(req)

  if (!userId) {
    console.log(`[guestbook][POST][${requestId}] No userId - returning 401`)
    return NextResponse.json(
      { error: 'Not authenticated', requestId },
      { status: 401 }
    )
  }

  console.log(`[guestbook][POST][${requestId}] User authenticated:`, userId)

  try {
    const user = await clerkClient.users.getUser(userId)
    console.log(`[guestbook][POST][${requestId}] Got user info:`, user.firstName, user.lastName)
  } catch (error) {
    console.error(`[guestbook][POST][${requestId}] Failed to get user from Clerk:`, error)
    return NextResponse.json(
      { error: 'Failed to get user information', requestId },
      { status: 500 }
    )
  }

  console.log(`[guestbook][POST][${requestId}] Checking rate limit`)
  const { success, remaining, reset } = await safeRatelimit(getKey(userId))
  if (!success) {
    console.log(`[guestbook][POST][${requestId}] Rate limit exceeded`)
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

  try {
    const data = await req.json()
    console.log(`[guestbook][POST][${requestId}] Parsing request body`)

    const parseResult = SignGuestbookSchema.safeParse(data)
    if (!parseResult.success) {
      console.log(`[guestbook][POST][${requestId}] Validation error:`, parseResult.error)
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.errors, requestId },
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
        console.log(`[guestbook][POST][${requestId}] Sending notification email`)
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
        console.log(`[guestbook][POST][${requestId}] Notification email sent`)
      } catch (emailError) {
        console.error(`[guestbook][POST][${requestId}] Email send error:`, emailError)
      }
    }

    const [newGuestbook] = await db
      .insert(guestbook)
      .values(guestbookData)
      .returning({
        newId: guestbook.id,
      })

    console.log(`[guestbook][POST][${requestId}] Message created successfully, id:`, newGuestbook.newId)

    return NextResponse.json(
      {
        ...guestbookData,
        id: GuestbookHashids.encode(newGuestbook.newId),
        createdAt: new Date(),
      } satisfies GuestbookDto,
      {
        status: 201,
        headers: {
          'X-Request-Id': requestId,
        },
      }
    )
  } catch (error) {
    console.error(`[guestbook][POST][${requestId}] Error creating message:`, error)
    console.error(`[guestbook][POST][${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to create message', requestId },
      { status: 500 }
    )
  }
}