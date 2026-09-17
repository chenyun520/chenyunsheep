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

export function ClerkUserStats({ render, fallback }: UserStatsProps) {
  const [users, setUsers] = useState<ClerkUser[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/clerk-users', { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json() as { users: ClerkUser[], totalCount: number }
          // 直接使用 API 返回的数据
          setUsers(data.users || [])
          // 使用 totalCount 或 users.length 作为真实人数
          setTotalUsers(data.totalCount ?? data.users?.length ?? 0)
        } else {
          console.error('Failed to fetch users:', response.status)

        }
      } catch (error) {
        console.error('Error fetching users:', error)

      } finally {
        setLoading(false)
      }
    }

    void fetchUsers()
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void fetchUsers()
    }, 30000)
    const refresh = () => { void fetchUsers() }
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  if (loading) {
    return <>{fallback || null}</>
  }

  return <>{render(users, totalUsers)}</>
}