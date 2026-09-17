import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) throw new Error('Clerk is not configured')
    const options = {
      headers: { Authorization: `Bearer ${secretKey}` },
      cache: 'no-store' as const,
    }
    const [usersResponse, countResponse] = await Promise.all([
      fetch('https://api.clerk.com/v1/users?limit=4&order_by=-created_at', options),
      fetch('https://api.clerk.com/v1/users/count', options),
    ])
    if (!usersResponse.ok || !countResponse.ok) {
      throw new Error('Failed to fetch community statistics')
    }
    const users = await usersResponse.json()
    const { total_count: totalCount } = await countResponse.json()
    return NextResponse.json({
      users: users.map((user: { id: string; first_name: string; last_name: string; image_url: string }) => ({
        id: user.id,
        first_name: user.first_name,
        full_name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        image_url: user.image_url,
      })),
      totalCount,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[Community statistics]', error)
    return NextResponse.json({ error: '暂时无法获取社区人数' }, { status: 503 })
  }
}
