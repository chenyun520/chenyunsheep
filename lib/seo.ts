export const seo = {
  title: 'Chenyun | 精益工程师、开发者、设计师、细节控',
  description:
    '我叫 Chenyun，一名精益工程师、开发者、设计师、细节控，致力于通过精益方法论创造高质量的产品和工作环境。',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://chenyun.so'
      : 'http://localhost:3000'
  ),
} as const
