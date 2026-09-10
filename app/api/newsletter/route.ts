import { Ratelimit } from '@upstash/ratelimit'
import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { emailConfig } from '~/config/email'
import { db } from '~/db'
import { subscribers } from '~/db/schema'
import ConfirmSubscriptionEmail from '~/emails/ConfirmSubscription'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { resend } from '~/lib/mail'
import { redis } from '~/lib/redis'

const newsletterFormSchema = z.object({
  email: z.string().email().min(1),
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(1, '10 s'),
  analytics: true,
})

export async function POST(req: NextRequest) {
  if (env.NODE_ENV === 'production') {
    const { success } = await ratelimit.limit('subscribe_' + (req.ip ?? ''))
    if (!success) {
      return NextResponse.error()
    }
  }

  try {
    // 同时兼容 react-hook-form 的 { data: {...} } 包装与普通 { email } 请求体
    const body = await req.json()
    const parsed = newsletterFormSchema.parse(body?.data ?? body)

    const [subscriber] = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.email, parsed.email))

    if (subscriber) {
      if (subscriber.subscribedAt) {
        return NextResponse.json({ status: 'success' })
      }

      // 未确认订阅者：重生成 token 并重发确认邮件（仅生产发信）
      const newToken = crypto.randomUUID()
      await db
        .update(subscribers)
        .set({ token: newToken })
        .where(eq(subscribers.email, parsed.email))

      if (env.NODE_ENV === 'production') {
        await resend.emails.send({
          from: emailConfig.from,
          to: parsed.email,
          subject: '来自 Chenyun 的订阅确认',
          react: ConfirmSubscriptionEmail({
            link: url(`confirm/${newToken}`).href,
          }),
        })
      }

      return NextResponse.json({ status: 'success' })
    }

    // generate a random one-time token
    const token = crypto.randomUUID()

    await db.insert(subscribers).values({
      email: parsed.email,
      token,
    })

    if (env.NODE_ENV === 'production') {
      await resend.emails.send({
        from: emailConfig.from,
        to: parsed.email,
        subject: '来自 Chenyun 的订阅确认',
        react: ConfirmSubscriptionEmail({
          link: url(`confirm/${token}`).href,
        }),
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('[Newsletter]', error)

    return NextResponse.error()
  }
}
