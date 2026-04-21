import { authMiddleware } from '@clerk/nextjs'
import { get } from '@vercel/edge-config'
import { type NextRequest, NextResponse } from 'next/server'

import { getIP } from '~/lib/ip'

export const config = {
  matcher: ['/((?!_next|studio|.*\\..*).*)'],
}

async function beforeAuthMiddleware(req: NextRequest) {
  const { geo, nextUrl } = req
  const isApi = nextUrl.pathname.startsWith('/api/')

  try {
    if (process.env.EDGE_CONFIG) {
      const blockedIPs = await get<string[]>('blocked_ips')
      const ip = getIP(req)

      if (blockedIPs?.includes(ip)) {
        if (isApi) {
          return NextResponse.json(
            { error: 'You have been blocked.' },
            { status: 403 }
          )
        }

        nextUrl.pathname = '/blocked'
        return NextResponse.rewrite(nextUrl)
      }

      if (nextUrl.pathname === '/blocked') {
        nextUrl.pathname = '/'
        return NextResponse.redirect(nextUrl)
      }
    }
  } catch (error) {
    console.error('[middleware] beforeAuth error:', error)
  }

  return NextResponse.next()
}

export default authMiddleware({
  beforeAuth: beforeAuthMiddleware,
  publicRoutes: [
    '/',
    '/studio(.*)',
    '/blog(.*)',
    '/confirm(.*)',
    '/projects',
    '/training',
    '/guestbook',
    '/newsletters(.*)',
    '/about',
    '/rss',
    '/feed',
    '/ama',
    '/api/feed',
    '/api/rss',
    '/api/favicon',
    '/api/link-preview',
    '/api/reactions',
  ],
})