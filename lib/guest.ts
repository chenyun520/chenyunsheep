import Hashids from 'hashids'
import { z } from 'zod'

// 站长专属昵称，防止游客冒充
export const RESERVED_NICKNAMES = [
  '陈云',
  'chenyun',
  'chenyun-sheep',
  'admin',
  'administrator',
  'root',
  '站长',
  '博主',
]

export const GuestNicknameSchema = z
  .string()
  .trim()
  .min(1, '昵称至少 1 个字符')
  .max(20, '昵称最多 20 个字符')

export function isReservedNickname(nickname: string) {
  const normalized = nickname.trim().toLowerCase()
  return RESERVED_NICKNAMES.some((name) => name.toLowerCase() === normalized)
}

const GuestHashids = new Hashids('guest-nickname', 6)

function stableHash(input: string): number {
  let hash = 0
  for (const char of input) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) % 1000000
  }
  return hash
}

export type GuestIdentity = {
  userId: string
  userInfo: {
    firstName: string
    lastName: null
    imageUrl: string
  }
}

// 同一昵称恒定生成同一身份与头像（public/avatars/ 共 8 张）
export function buildGuestIdentity(nickname: string): GuestIdentity {
  const trimmed = nickname.trim()
  const seed = stableHash(trimmed)
  return {
    userId: `guest:${GuestHashids.encode(seed)}`,
    userInfo: {
      firstName: trimmed,
      lastName: null,
      imageUrl: `/avatars/avatar_${(seed % 8) + 1}.png`,
    },
  }
}
