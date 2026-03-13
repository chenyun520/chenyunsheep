import { auth } from '@clerk/nextjs'
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
import { ratelimit } from '~/lib/redis'

function getKey(id?: string) {
  return `guestbook${id ? `:${id}` : ''}`
}

export async function GET(req: NextRequest) {
  // GET 是公开的，不需要认证检查
  try {
    const { success } = await ratelimit.limit(getKey(req.ip ?? ''))
    if (!success) {
      return new Response('Too Many Requests', {
        status: 429,
      })
    }

    return NextResponse.json(await fetchGuestbookMessages())
  } catch (error) {
    console.error('[guestbook] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

const SignGuestbookSchema = z.object({
  message: z.string().min(1).max(600),
})

export async function POST(req: NextRequest) {
  // 使用 auth() 获取认证状态
  const { userId } = auth()

  console.log('[guestbook] POST - userId:', userId)

  if (!userId) {
    console.log('[guestbook] No userId - returning 401')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { success } = await ratelimit.limit(getKey(userId))
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
    })
  }

  try {
    const data = await req.json()
    const { message } = SignGuestbookSchema.parse(data)

    const guestbookData = {
      userId,
      message,
      userInfo: {
        firstName: null,
        lastName: null,
        imageUrl: null,
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
            userFirstName: null,
            userLastName: null,
            userImageUrl: undefined,
            commentContent: message,
          }),
        })
      } catch (emailError) {
        console.error('[guestbook] Email send error:', emailError)
        // 继续执行，不因为邮件失败而中断
      }
    }

    const [newGuestbook] = await db
      .insert(guestbook)
      .values(guestbookData)
      .returning({
        newId: guestbook.id,
      })

    console.log('[guestbook] POST success - id:', newGuestbook.newId)

    return NextResponse.json(
      {
        ...guestbookData,
        id: GuestbookHashids.encode(newGuestbook.newId),
        createdAt: new Date(),
      } satisfies GuestbookDto,
      {
        status: 201,
      }
    )
  } catch (error) {
    console.error('[guestbook] POST error:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}