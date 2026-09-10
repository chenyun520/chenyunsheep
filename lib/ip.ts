import { type NextRequest } from 'next/server'

export function getIP(request: Request | NextRequest): string {
  if ('ip' in request && request.ip) {
    return request.ip
  }

  const xff = request.headers.get('x-forwarded-for')
  if (xff === '::1') {
    return '127.0.0.1'
  }

  return xff?.split(',')?.[0] ?? '127.0.0.1'
}

// 将 IPv6 地址展开为完整 8 组小写十六进制形式，无法解析时抛错
function expandIPv6(ip: string): string {
  const invalid = () => new Error(`Invalid IPv6 address: ${ip}`)
  let address = ip

  // 处理 IPv4 结尾形式（如 ::ffff:192.168.1.1），转成两组十六进制
  const v4Match = address.match(/^(.+):(\d{1,3}(?:\.\d{1,3}){3})$/)
  if (v4Match) {
    const octets = v4Match[2].split('.').map(Number)
    if (octets.some((octet) => !Number.isInteger(octet) || octet > 255)) {
      throw invalid()
    }
    const hex = octets
      .map((octet) => octet.toString(16).padStart(2, '0'))
      .join('')
    address = `${v4Match[1]}:${hex.slice(0, 4)}:${hex.slice(4)}`
  }

  const isValidGroup = (group: string) => /^[0-9a-fA-F]{1,4}$/.test(group)
  const halves = address.split('::')
  if (halves.length > 2) {
    throw invalid()
  }

  let groups: string[]
  if (halves.length === 2) {
    // :: 缩写形式，补齐中间的 0 组
    const head = halves[0] ? halves[0].split(':') : []
    const tail = halves[1] ? halves[1].split(':') : []
    if (![...head, ...tail].every(isValidGroup)) {
      throw invalid()
    }
    const missing = 8 - head.length - tail.length
    if (missing < 1) {
      throw invalid()
    }
    groups = [...head, ...Array.from({ length: missing }, () => '0'), ...tail]
  } else {
    groups = address.split(':')
    if (groups.length !== 8 || !groups.every(isValidGroup)) {
      throw invalid()
    }
  }

  return groups.map((group) => group.toLowerCase().padStart(4, '0')).join(':')
}

// 将 IP 规范化为限流键：IPv6 截断到 /64 前缀（防止在同一 /64 内轮换地址绕过限流），IPv4 原样
export function normalizeIpForRateLimit(ip: string): string {
  if (ip.includes(':') && ip !== 'unknown') {
    try {
      const expanded = expandIPv6(ip)
      return expanded.split(':').slice(0, 4).join(':') + '::/64'
    } catch {
      // 解析异常则原样返回，宁可保守不限流也不误杀
      return ip
    }
  }
  return ip
}
