'use client'

import { useEffect, useState } from 'react'

interface ClerkUser {
  id: string
  first_name?: string
  last_name?: string
  full_name?: string
  image_url?: string
  email_addresses?: Array<{ email_address: string }>
}

interface UserStatsProps {
  render: (users: ClerkUser[], totalUsers: number) => React.ReactNode
  fallback?: React.ReactNode
}

// 硬编码的测试用户数据（基于 Clerk 测试账户）
const HARDCODED_USERS: ClerkUser[] = [
  {
    id: 'user_1',
    full_name: '咩咩 羊',
    image_url: 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zQVBxVnd6Sm9aSmw4VWlMV0pZTjh2aE5SdFMiLCJyaWQiOiJ1c2VyXzNBVmEwd3c2U2ZsNVVJY1BVTHpvWlJINTN6SSIsImluaXRpYWxzIjoi5ZKp576KIn0',
    email_addresses: [{ email_address: '1291367517@qq.com' }],
  },
  {
    id: 'user_2',
    full_name: 'leqing qu',
    image_url: 'https://images.clerk.dev/uploaded/img_3AVWHQTmqPHlTEz9RgUCnGWBctt',
    email_addresses: [{ email_address: '18235083473@163.com' }],
  },
  {
    id: 'user_3',
    full_name: 'qu qu',
    image_url: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zQVQ0TnQzZzN1cEt1UEhQZmhGRkVqellBRWsifQ',
    email_addresses: [{ email_address: 'ququ2399@gmail.com' }],
  },
  {
    id: 'user_4',
    full_name: '诚 陈',
    image_url: 'https://img.clerk.com/eyJ0eXBlIjoiZGVmYXVsdCIsImlpZCI6Imluc18zQVBxVnd6Sm9aSmw4VWlMV0pZTjh2aE5SdFMiLCJyaWQiOiJ1c2VyXzNBU3hMYk5ORnk1VWNJUDJEUE1IQXloWU9TWSIsImluaXRpYWxzIjoi6K+a6ZmIIn0',
    email_addresses: [{ email_address: '1178115320@qq.com' }],
  },
  {
    id: 'user_5',
    full_name: '云 陈',
    image_url: 'https://images.clerk.dev/uploaded/img_3AVH1LrnN5H4l3f3rJpu6KLubci',
    email_addresses: [{ email_address: 'gaolujie26@gmail.com' }],
  },
]

export function ClerkUserStats({ render, fallback }: UserStatsProps) {
  const [users, setUsers] = useState<ClerkUser[]>(HARDCODED_USERS)
  const [totalUsers, setTotalUsers] = useState(HARDCODED_USERS.length)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/clerk-users')
        if (response.ok) {
          const data = await response.json() as { users: ClerkUser[], totalCount: number }
          const fetchedUsers = data.users || []
          // 只有当 API 返回有效用户时才使用，否则使用硬编码数据
          if (fetchedUsers.length > 0) {
            setUsers(fetchedUsers)
            setTotalUsers(data.totalCount || fetchedUsers.length)
          }
        }
      } catch (error) {
        console.log('API fetch failed, using hardcoded users')
      } finally {
        setLoading(false)
      }
    }

    void fetchUsers()
  }, [])

  if (loading) {
    return <>{fallback || null}</>
  }

  return <>{render(users, totalUsers)}</>
}
