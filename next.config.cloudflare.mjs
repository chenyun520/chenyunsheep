/**
 * Cloudflare Pages 专用配置
 * 这个配置会被 Cloudflare 自动检测并使用
 */

// 导入标准配置
const baseConfig = require('./next.config.mjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...baseConfig,

  // Cloudflare Pages 需要
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/**`,
      },
      {
        protocol: 'https',
        hostname: '**.cherishbloom.top',
      },
    ],
  },
}

module.exports = nextConfig
