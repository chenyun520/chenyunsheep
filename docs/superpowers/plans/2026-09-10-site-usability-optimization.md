# 整站功能可用性优化 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让访客免登录即可留言/评论、本地 dev 可启动、Newsletter 链路可验证、SEO 修复、产出 Sanity 清理清单。

**Architecture:** 在现有 Clerk 认证之外新增"游客身份"分支——API 层接受昵称、合成 `guest:` userId 复用现有 `userInfo` 结构（firstName + 本地头像路径），渲染端零改动。middleware 补齐公开 API 路由。SEO 为三处小修。Sanity 清理由站主按生成的清单操作。

**Tech Stack:** Next.js 14 App Router、zod、Drizzle/Neon、Upstash ratelimit、hashids、Playwright（验证）、vercel CLI（拉取环境变量）。

**工作目录说明：** 直接在主工作树 `/Volumes/文件磁盘/陈云博客` 执行（不用 worktree）——因为站主有 3 个未提交文件在此、vercel link 与 .env.local 也需要落在这里。规格文档：`docs/superpowers/specs/2026-09-10-site-usability-optimization-design.md`。

**验证方式说明：** 本仓库没有测试框架（无 jest/vitest），按规格的测试计划用 curl 集成测试 + Playwright UI 走查替代，每步给出精确命令与期望输出。

---

### Task 1: 本地开发环境跑通

**Files:**
- Create: `.env.local`（由 vercel CLI 生成，绝不提交）
- Verify: `.gitignore` 已忽略

- [ ] **Step 1.1: 安装 vercel CLI**

Run: `npm i -g vercel && vercel --version`
Expected: 输出版本号（如 `42.x.x`）

- [ ] **Step 2.1: 站主登录 vercel（需人工操作）**

让站主在会话中执行：`! vercel login`（浏览器完成授权）。若已登录则 `vercel whoami` 直接返回用户名。

- [ ] **Step 3.1: 关联项目并拉取环境变量**

Run（在仓库根目录）:
```bash
vercel link --yes --project chenyun.so
vercel env pull .env.local --yes
```
Expected: `.env.local` 生成，含 `DATABASE_URL`、`UPSTASH_REDIS_REST_URL`、`NEXT_PUBLIC_SANITY_PROJECT_ID`、`CLERK_SECRET_KEY` 等。若项目名不是 `chenyun.so`，先 `vercel projects ls` 确认。

- [ ] **Step 4.1: 确认 .gitignore 覆盖**

Run: `grep -n "env" .gitignore`
Expected: 至少包含 `.env*.local` 或 `.env*` 一类规则；若没有，向 `.gitignore` 追加 `.env.local`。

- [ ] **Step 5.1: 启动 dev server 验证**

Run: `npm run dev`（后台），然后 `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
Expected: 编译成功，返回 `200`（首次编译等 30–60s）。

- [ ] **Step 6.1: 不提交（本任务无代码变更）**

---

### Task 2: middleware 补齐公开 API 路由（留言墙认证问题的根源）

**Files:**
- Modify: `middleware.ts:46-68`（publicRoutes 数组）

- [ ] **Step 1: 修改 publicRoutes**

在 `'/api/link-preview',` 之后、`'/api/reactions',` 之前插入：

```ts
    '/api/guestbook',
    '/api/comments(.*)',
    '/api/newsletter',
    '/api/activity',
    '/api/tweet(.*)',
```

（理由：这些 GET/POST 的鉴权/游客逻辑在各自 handler 内用 `getAuth` 判断；middleware 层拦截导致未登录访客全部 401 —— 即 git 历史里反复"修复留言墙认证"的根因。）

- [ ] **Step 2: 验证游客可直接 GET 留言**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/guestbook`
Expected: `200`（改动前为 `401` 或重定向）。

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "fix: 中间件补齐公开 API 路由，修复访客被 401 拦截"
```

---

### Task 3: 游客身份工具库 lib/guest.ts

**Files:**
- Create: `lib/guest.ts`

- [ ] **Step 1: 写入实现**

```ts
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
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc --noEmit`
Expected: 无新增错误（仓库既有错误数不变；首次跑记录基线）。

- [ ] **Step 3: Commit**

```bash
git add lib/guest.ts
git commit -m "feat: 游客身份工具（昵称校验/保留名单/稳定身份与头像）"
```

---

### Task 4: /api/guestbook 支持游客留言

**Files:**
- Modify: `app/api/guestbook/route.ts`

- [ ] **Step 1: 扩展请求 Schema**

把 `app/api/guestbook/route.ts:56-58` 的 schema 替换为：

```ts
const SignGuestbookSchema = z.object({
  message: z.string().min(1).max(600),
  nickname: z.string().optional(),
})
```

- [ ] **Step 2: 加游客限流器**

在 `safeRatelimit`（`app/api/guestbook/route.ts:20-33`）之后新增：

```ts
async function safeGuestRatelimit(ip: string) {
  try {
    const { Ratelimit } = await import('@upstash/ratelimit')
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '600 s'),
      analytics: false,
    })
    const result = await ratelimit.limit(`guestbook:guest:${ip}`)
    return { success: result.success, reset: result.reset }
  } catch {
    return { success: true, reset: Date.now() + 600000 }
  }
}
```

- [ ] **Step 3: 重写 POST 的身份解析**

把 `app/api/guestbook/route.ts` 中 `export async function POST`（60–142 行）整体替换为：

```ts
export async function POST(req: NextRequest) {
  const { userId: clerkUserId } = getAuth(req)

  // 游客按 IP 更严限流；登录用户沿用原限流
  const { success, reset } = clerkUserId
    ? await safeRatelimit(getKey(clerkUserId))
    : await safeGuestRatelimit(req.ip ?? 'unknown')
  if (!success) {
    return NextResponse.json(
      { error: '发布太频繁啦，稍后再试试', retryAfter: reset },
      { status: 429 }
    )
  }

  try {
    const data = await req.json()
    const parseResult = SignGuestbookSchema.safeParse(data)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parseResult.error.errors },
        { status: 400 }
      )
    }

    const { message, nickname } = parseResult.data

    let userId: string
    let userInfo: GuestbookDto['userInfo']
    if (clerkUserId) {
      const user = await clerkClient.users.getUser(clerkUserId)
      userId = clerkUserId
      userInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      }
    } else {
      const nicknameCheck = GuestNicknameSchema.safeParse(nickname ?? '')
      if (!nicknameCheck.success) {
        return NextResponse.json(
          { error: '请先填写昵称（1-20 个字符）' },
          { status: 400 }
        )
      }
      if (isReservedNickname(nicknameCheck.data)) {
        return NextResponse.json(
          { error: '这个昵称是站长专属，换一个吧' },
          { status: 400 }
        )
      }
      const guest = buildGuestIdentity(nicknameCheck.data)
      userId = guest.userId
      userInfo = guest.userInfo
    }

    const guestbookData = {
      userId,
      message,
      userInfo,
    }

    if (env.NODE_ENV === 'production' && env.SITE_NOTIFICATION_EMAIL_TO) {
      try {
        await resend.emails.send({
          from: emailConfig.from,
          to: env.SITE_NOTIFICATION_EMAIL_TO,
          subject: '👋 有人刚刚在留言墙留言了',
          react: NewGuestbookEmail({
            link: url(`/guestbook`).href,
            userFirstName: userInfo.firstName ?? '游客',
            userLastName: userInfo.lastName ?? null,
            userImageUrl: userInfo.imageUrl ?? undefined,
            commentContent: message,
          }),
        })
      } catch (emailError) {
        console.error('[guestbook][POST] Email send error:', emailError)
      }
    }

    const [newGuestbook] = await db
      .insert(guestbook)
      .values(guestbookData)
      .returning({
        newId: guestbook.id,
      })

    return NextResponse.json(
      {
        ...guestbookData,
        id: GuestbookHashids.encode(newGuestbook.newId),
        createdAt: new Date(),
      } satisfies GuestbookDto,
      { status: 201 }
    )
  } catch (error) {
    console.error('[guestbook][POST] Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
```

同时在文件头部 import 区（`~/lib/redis` 之后）加：

```ts
import {
  buildGuestIdentity,
  GuestNicknameSchema,
  isReservedNickname,
} from '~/lib/guest'
```

- [ ] **Step 4: curl 集成验证**

```bash
# 游客留言成功
curl -s -X POST http://localhost:3000/api/guestbook \
  -H 'Content-Type: application/json' \
  -d '{"message":"集成测试：游客留言","nickname":"测试访客"}'
# 期望 201，返回 JSON 里 userInfo.firstName === "测试访客"，userId 以 "guest:" 开头

# 缺昵称 → 400
curl -s -X POST http://localhost:3000/api/guestbook \
  -H 'Content-Type: application/json' -d '{"message":"没有昵称"}'
# 期望 400 {"error":"请先填写昵称（1-20 个字符）"}

# 冒充站长 → 400
curl -s -X POST http://localhost:3000/api/guestbook \
  -H 'Content-Type: application/json' -d '{"message":"我是站长","nickname":"陈云"}'
# 期望 400 {"error":"这个昵称是站长专属，换一个吧"}

# 昵称超长 → 400
curl -s -X POST http://localhost:3000/api/guestbook \
  -H 'Content-Type: application/json' \
  -d "{\"message\":\"x\",\"nickname\":\"$(printf 'a%.0s' {1..21})\"}"
# 期望 400

# GET 列表包含新留言
curl -s http://localhost:3000/api/guestbook | head -c 300
# 期望 JSON 数组，含 "集成测试：游客留言"

# 清理测试数据（连生产库时执行；本地验证如连的是生产 Neon 库务必执行）
```

注意：`.env.local` 拉的是生产环境变量，本地 dev 也直连**生产 Neon/Redis**——测试留言验证完立即删除：进 `/admin` 或用 SQL `DELETE FROM guestbook WHERE message LIKE '集成测试%'`（执行前向站主展示）。

- [ ] **Step 5: Commit**

```bash
git add app/api/guestbook/route.ts
git commit -m "feat: 留言墙支持免登录游客留言（昵称+限流+保留昵称）"
```

---

### Task 5: GuestbookInput 游客表单 UI

**Files:**
- Modify: `app/(main)/guestbook/GuestbookInput.tsx`

- [ ] **Step 1: 加昵称状态与头像回退**

在 `GuestbookInput.tsx:30-32`（state 声明区）加：

```ts
const [nickname, setNickname] = React.useState('')
```

- [ ] **Step 2: 替换"未登录骨架屏"分支**

把 `GuestbookInput.tsx:127-131`：

```ts
if (!user) {
  return (
    <div className="h-[82px] animate-pulse rounded-xl bg-white/70 ring-2 ring-zinc-200/30 dark:bg-zinc-800/80 dark:ring-zinc-700/30" />
  )
}
```

整段删除（未登录也渲染完整表单，Clerk 加载失败不再卡骨架屏）。

- [ ] **Step 3: 头像区分登录/游客**

把 `GuestbookInput.tsx:181-190` 的 `<Image src={user.imageUrl || ...}` 块中的 src 改为按身份取值。在组件 return 前加：

```ts
const avatarSrc = user
  ? user.imageUrl || `/avatars/avatar_1.png`
  : buildGuestIdentity(nickname.trim() || '游客').userInfo.imageUrl
```

对应 `<Image>` 的 `src={avatarSrc}`。

- [ ] **Step 4: 游客昵称输入框**

在 `<div className="z-10 ml-2 flex-1 shrink-0 md:ml-4">`（原 192 行）内部、`{isPreviewing ? ...}` 之前插入：

```tsx
{!user ? (
  <input
    type="text"
    value={nickname}
    maxLength={20}
    onChange={(event) => setNickname(event.target.value)}
    placeholder="你的昵称（必填）"
    aria-label="昵称"
    className="mb-2 block w-[200px] shrink-0 rounded-lg bg-zinc-100/80 px-2 py-1 text-xs text-zinc-800 placeholder-zinc-400 outline-none ring-1 ring-zinc-200/50 transition focus:ring-lime-400/60 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700/50"
  />
) : null}
```

（用三元而非 `&&` 渲染，符合条件渲染规范。）

- [ ] **Step 5: 提交携带昵称 + 错误处理去掉登录引导**

`mutationFn` 的 body 改为：

```ts
body: JSON.stringify({
  message,
  ...(user ? {} : { nickname: nickname.trim() }),
}),
```

`onError` 分支改为：

```ts
onError: (error: Error) => {
  console.error('Failed to sign guestbook:', error)
  alert('发送失败: ' + error.message)
},
```

（游客错误提示直接展示 API 的中文 message；登录态过期场景已不存在——未登录即为游客。）

import 区加：

```ts
import { buildGuestIdentity } from '~/lib/guest'
```

（`useClerk`/`openSignIn` 不再使用，一并从 import 移除，保持 lint 干净。）

- [ ] **Step 6: Playwright UI 验证**

脚本 `/tmp/verify_guestbook_ui.py`：

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_context(viewport={"width": 1440, "height": 900}, locale="zh-CN").new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto("http://localhost:3000/guestbook", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)  # 等 react-query 拉取
    page.fill('input[aria-label="昵称"]', "测试访客")
    page.fill('textarea', "UI 自动化测试留言")
    page.click('footer button:has(svg)')  # 发送按钮
    page.wait_for_timeout(2000)
    body = page.inner_text("body")
    assert "UI 自动化测试留言" in body, "留言未出现在列表"
    assert "测试访客" in body, "昵称未展示"
    print("UI PASS", errors)
    browser.close()
```

Run: `python3 /tmp/verify_guestbook_ui.py`
Expected: `UI PASS []`。验证后删除该测试留言。

- [ ] **Step 7: Commit**

```bash
git add "app/(main)/guestbook/GuestbookInput.tsx"
git commit -m "feat: 留言墙游客表单（昵称输入+本地头像，摆脱 Clerk 依赖）"
```

---

### Task 6: /api/comments 支持游客评论

**Files:**
- Modify: `app/api/comments/[id]/route.ts`

- [ ] **Step 1: 扩展 Schema**

`app/api/comments/[id]/route.ts:100-106` 替换为：

```ts
const CreateCommentSchema = z.object({
  body: z.object({
    blockId: z.string().optional(),
    text: z.string().min(1).max(999),
  }),
  parentId: z.string().nullable().optional(),
  nickname: z.string().optional(),
})
```

- [ ] **Step 2: 重写 POST 身份解析**

把 POST 函数（108–236 行）中 `const { userId } = getAuth(req)` 起、到 `const commentData = {...}` 构造完成的段落改为（保持函数其余结构：post 校验、邮件通知、入库、返回不变）：

```ts
const { userId: clerkUserId } = getAuth(req)

if (!clerkUserId) {
  const guestRate = await safeGuestCommentRatelimit(req.ip ?? 'unknown')
  if (!guestRate.success) {
    return NextResponse.json(
      { error: '评论太频繁啦，稍后再试', retryAfter: guestRate.reset },
      { status: 429 }
    )
  }
} else {
  const { success, remaining, reset } = await safeRatelimit(
    getKey(postId) + `_${req.ip ?? ''}`
  )
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests', retryAfter: reset },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    )
  }
}
```

（原函数开头 109–132 行的统一限流替换为上述分支；`safeGuestCommentRatelimit` 加在 `safeRatelimit` 后：）

```ts
async function safeGuestCommentRatelimit(ip: string) {
  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '600 s'),
      analytics: false,
    })
    const result = await ratelimit.limit(`comments:guest:${ip}`)
    return { success: result.success, reset: result.reset }
  } catch {
    return { success: true, reset: Date.now() + 600000 }
  }
}
```

解析数据后（原 158–173 行 `const user = await clerkClient...` 与 `commentData` 构造）替换为：

```ts
const { body, parentId: hashedParentId, nickname } = parseResult.data
const [parentId] = CommentHashids.decode(hashedParentId ?? '')

let userId: string
let userInfo: {
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
}
if (clerkUserId) {
  const user = await clerkClient.users.getUser(clerkUserId)
  userId = user.id
  userInfo = {
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl || null,
  }
} else {
  const nicknameCheck = GuestNicknameSchema.safeParse(nickname ?? '')
  if (!nicknameCheck.success) {
    return NextResponse.json(
      { error: '请先填写昵称（1-20 个字符）' },
      { status: 400 }
    )
  }
  if (isReservedNickname(nicknameCheck.data)) {
    return NextResponse.json(
      { error: '这个昵称是站长专属，换一个吧' },
      { status: 400 }
    )
  }
  const guest = buildGuestIdentity(nicknameCheck.data)
  userId = guest.userId
  userInfo = guest.userInfo
}

const commentData = {
  postId,
  userId,
  body,
  userInfo,
  parentId: parentId ? (parentId as number) : null,
}
```

- [ ] **Step 3: 回复邮件通知跳过游客**

在回复通知块（原 175 行 `if (parentId && ...)` 内）：

```ts
if (parentUserFromDb && parentUserFromDb.userId !== userId) {
```

之前加守卫（游客父评论无法收邮件，且 `clerkClient.users.getUser('guest:...')` 会抛错）：

```ts
if (parentUserFromDb?.userId.startsWith('guest:')) {
  // 父评论是游客留言，无邮箱可通知，跳过
} else if (parentUserFromDb && parentUserFromDb.userId !== userId) {
```

邮件模板参数 `userFirstName/userLastName` 用 `userInfo.firstName ?? '游客'`、`userInfo.lastName ?? null` 替换原 `user.firstName/user.lastName`，`userImageUrl: userInfo.imageUrl ?? undefined`。

- [ ] **Step 4: import 与 curl 验证**

import 区加：

```ts
import {
  buildGuestIdentity,
  GuestNicknameSchema,
  isReservedNickname,
} from '~/lib/guest'
```

先取一篇真实文章 postId（Sanity `_id`）：

```bash
PID=$(curl -s "https://${NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/query/${NEXT_PUBLIC_SANITY_DATASET}?query=*%5B_type%3D%3D%22post%22%5D%5B0%5D._id" | sed -E 's/.*"result":"([^"]+)".*/\1/')
curl -s -X POST http://localhost:3000/api/comments/$PID \
  -H 'Content-Type: application/json' \
  -d '{"body":{"text":"集成测试：游客评论"},"nickname":"测试访客"}'
# 期望 201，返回 JSON 的 userInfo.firstName === "测试访客"

curl -s -X POST http://localhost:3000/api/comments/$PID \
  -H 'Content-Type: application/json' -d '{"body":{"text":"无昵称"}}'
# 期望 400
```

验证后删除测试评论（SQL：`DELETE FROM comments WHERE body::text LIKE '%集成测试%'`，执行前向站主展示）。

- [ ] **Step 5: Commit**

```bash
git add "app/api/comments/[id]/route.ts"
git commit -m "feat: 博客评论支持免登录游客（昵称+限流+回复通知跳过游客）"
```

---

### Task 7: Commentable 游客评论 UI

**Files:**
- Modify: `components/Commentable.tsx`

- [ ] **Step 1: Root 增加昵称状态并传递**

`components/Commentable.tsx:59-60`（`const { user: me } = useUser()` 之后）加：

```ts
const [guestNickname, setGuestNickname] = React.useState('')
```

`mutationFn`（107–119 行）body 改为：

```ts
body: JSON.stringify({
  body: {
    blockId,
    text: comment,
  } satisfies CommentDto['body'],
  parentId: blogPostState.replyingTo?.id,
  ...(me ? {} : { nickname: guestNickname.trim() }),
}),
```

- [ ] **Step 2: 用统一表单替换 SignedIn/SignedOut**

把表单内部（原 301–320 行）：

```tsx
<SignedIn>
  <CommentTextarea isPending={isPending} onSubmit={onSubmit} />
</SignedIn>

<SignedOut>
  ...登录后参与讨论...
</SignedOut>
```

替换为：

```tsx
<CommentTextarea
  isPending={isPending}
  onSubmit={onSubmit}
  isGuest={!me}
  nickname={guestNickname}
  onNicknameChange={setGuestNickname}
/>
```

（移除 `SignedIn/SignedOut/SignInButton/UserArrowLeftIcon` 的 import——Clerk 组件加载失败时不再导致表单空白。）

- [ ] **Step 3: CommentTextarea 游客模式**

`CommentTextareaProps`（450–453 行）改为：

```ts
type CommentTextareaProps = {
  isPending?: boolean
  onSubmit?: (comment: string) => void
  isGuest?: boolean
  nickname?: string
  onNicknameChange?: (value: string) => void
}
```

组件签名解构相应加 `isGuest, nickname, onNicknameChange`。头像（原 587–594 行）改为：

```tsx
<Image
  src={
    isGuest
      ? buildGuestIdentity(nickname?.trim() || '游客').userInfo.imageUrl
      : me?.imageUrl || `/avatars/avatar_1.png`
  }
  alt=""
  className="h-6 w-6 select-none rounded-full"
  width={24}
  height={24}
  unoptimized
/>
```

在 textarea 容器 `<div className="flex w-full items-end pb-1">` 之前插入昵称输入：

```tsx
{isGuest ? (
  <input
    type="text"
    value={nickname ?? ''}
    maxLength={20}
    onChange={(e) => onNicknameChange?.(e.target.value)}
    placeholder="你的昵称（必填）"
    aria-label="昵称"
    className="mb-1 block w-[180px] shrink-0 rounded-md bg-zinc-100/80 px-2 py-1 text-xs text-zinc-800 placeholder-zinc-400 outline-none ring-1 ring-zinc-200/50 dark:bg-zinc-800/80 dark:text-zinc-200 dark:ring-zinc-700/50"
  />
) : null}
```

import 区加 `import { buildGuestIdentity } from '~/lib/guest'`。

- [ ] **Step 4: Playwright 验证游客评论**

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_context(viewport={"width": 1440, "height": 900}, locale="zh-CN").new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto("http://localhost:3000/blog/ai-agent", wait_until="domcontentloaded")
    page.wait_for_timeout(4000)
    # 页面底部评论区（BlogReactions 附近的 Commentable 由博客正文块触发；
    # 兜底：找任意 昵称 输入框证明游客表单渲染）
    assert page.locator('input[aria-label="昵称"]').count() >= 1, "游客昵称输入框未渲染"
    print("COMMENT UI PASS", errors)
    browser.close()
```

Run: `python3 /tmp/verify_comment_ui.py` → Expected: `COMMENT UI PASS []`
（如果该文章评论区结构不同导致定位失败，人工在浏览器确认后再通过。）

- [ ] **Step 5: Commit**

```bash
git add components/Commentable.tsx
git commit -m "feat: 评论区游客昵称表单，移除 Clerk 组件依赖"
```

---

### Task 8: Newsletter 本地可验证

**Files:**
- Modify: `app/api/newsletter/route.ts:49-63`

- [ ] **Step 1: 订阅落库不再限定生产环境**

把：

```ts
if (env.NODE_ENV === 'production') {
  await resend.emails.send({ ... })

  await db.insert(subscribers).values({
    email: parsed.email,
    token,
  })
}
```

改为：

```ts
await db.insert(subscribers).values({
  email: parsed.email,
  token,
})

if (env.NODE_ENV === 'production') {
  await resend.emails.send({ ...原参数不变... })
}
```

（开发环境也落库便于本地验证确认链接；邮件仍只在生产发。）

- [ ] **Step 2: 本地全链路验证**

```bash
# 1. 订阅（dev 下不真发邮件）
curl -s -X POST http://localhost:3000/api/newsletter \
  -H 'Content-Type: application/json' \
  -d '{"email":"test-local@example.com"}'
# 期望 {"status":"success"}

# 2. 查库拿 token（连的生产库，向站主展示后再执行）
psql "$DATABASE_URL" -c "SELECT email, token FROM subscribers WHERE email='test-local@example.com';"

# 3. 确认链接本地可访问
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/confirm/<上一步的token>"
# 期望 200

# 4. 清理
psql "$DATABASE_URL" -c "DELETE FROM subscribers WHERE email='test-local@example.com';"
```

（无 psql 时用 `npx drizzle-kit studio` 或 Neon 控制台人工查删。）

- [ ] **Step 3: Commit**

```bash
git add app/api/newsletter/route.ts
git commit -m "fix: 订阅确认在开发环境也落库，链路可本地验证"
```

---

### Task 9: SEO 修复

**Files:**
- Modify: `app/(main)/training/page.tsx`、`app/(main)/about/page.tsx:5-9`、`app/layout.tsx:21`

- [ ] **Step 1: /training 补 metadata**

在 `app/(main)/training/page.tsx` 的 `import` 之后、`function ServiceCard3D` 之前加：

```ts
const title = '培训课程'
const description = '分享精益生产与现场管理的实战经验：生产现场日常管理、精益6S管理培训课件，以及课件开发与课程培训服务。'

export const metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description, card: 'summary_large_image' },
} satisfies Metadata
```

并在 import 区加 `import { type Metadata } from 'next'`。

- [ ] **Step 2: /about 标题去重**

`app/(main)/about/page.tsx:5-9` 的 metadata 改为：

```ts
export const metadata = {
  title: '关于我',
  description:
    '精益工程师、全栈开发者、UI/UX 设计师。热爱技术、设计与持续改善。',
}
```

（布局模板会自动追加 `| Chenyun`，最终标题为"关于我 | Chenyun"。）

- [ ] **Step 3: 根 keywords 去模板化**

`app/layout.tsx:21` 改为：

```ts
keywords: '陈云,chenyun,chenyun-sheep,精益工程师,6S管理,精益生产,培训,Next.js,全栈开发',
```

- [ ] **Step 4: 验证**

```bash
curl -s http://localhost:3000/training | grep -o '<title>[^<]*</title>'
# 期望 <title>培训课程 | Chenyun</title>
curl -s http://localhost:3000/about | grep -o '<title>[^<]*</title>'
# 期望 <title>关于我 | Chenyun</title>（不再双 Chenyun）
```

- [ ] **Step 5: Commit**

```bash
git add "app/(main)/training/page.tsx" "app/(main)/about/page.tsx" app/layout.tsx
git commit -m "fix: SEO 标题修复（training 补标题/about 去重/keywords 去模板遗留）"
```

---

### Task 10: Sanity 清理清单生成

**Files:**
- Create: `docs/sanity-cleanup-checklist.md`

- [ ] **Step 1: 查询分类引用数与项目清单**

```bash
source .env.local 2>/dev/null || export $(grep -v '^#' .env.local | xargs)
# 分类及被已发布文章引用数
curl -sG "https://${NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/query/${NEXT_PUBLIC_SANITY_DATASET}" \
  --data-urlencode 'query=*[_type=="category"]|order(title asc){"title":title,"slug":slug.current,"posts":count(*[_type=="post" && !(_id in path("drafts.**")) && references(^._id)])}' > /tmp/cats.json
# 项目清单
curl -sG "https://${NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/data/query/${NEXT_PUBLIC_SANITY_DATASET}" \
  --data-urlencode 'query=*[_type=="project"]|order(name asc){name,url}' > /tmp/projects.json
```

- [ ] **Step 2: 生成清单文档**

内容结构：一、可直接删除的分类（posts==0，如 图形学/文学/外语/委屈坚持的冬天 等模板遗留）；二、需先处理文章再删的分类（posts>0 且属于遗留）；三、建议保留；四、项目删除清单（对照 `getSettings` 的 projects[]->，未被 settings 引用的遗留项目——同样用 GROQ 查 settings 引用）。每项带操作路径：`/studio` → Content → Categories/Projects → 勾选删除。

- [ ] **Step 3: 站主在 /studio 删除后复查**

Run: Playwright 截图 `/blog` 与 `/projects`，确认遗留分类/项目消失。站主删除完成后执行。

- [ ] **Step 4: Commit**

```bash
git add docs/sanity-cleanup-checklist.md
git commit -m "docs: Sanity 遗留数据清理清单"
```

---

### Task 11: lint + build + 全功能走查

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: 无 error（warning 与基线持平）。

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: 构建成功，无类型错误。

- [ ] **Step 3: Playwright 全站走查（生产模式 `npm run start` 或 dev 均可）**

覆盖：首页/博客/文章页/项目/培训/留言墙/AMA/关于 全 200；留言墙游客完整流程（昵称+留言+列表出现）；点赞 `/api/reactions` 可用；无新增 console error（Clerk 相关除外）。

- [ ] **Step 4: 修复走查发现的问题（如有），复测**

---

### Task 12: 发布上线

- [ ] **Step 1: 汇总 diff 给站主确认**

`git diff main --stat` + 关键 diff 摘要，特别说明站主自己的 3 个未提交文件（layout.tsx / seo.ts / next.config.mjs）会一并提交：

```bash
git add app/layout.tsx lib/seo.ts next.config.mjs
git commit -m "chore: 站点身份与图片域名配置更新"
```

- [ ] **Step 2: 征得站主同意后推送**

Run: `git push origin main`（触发 Vercel 自动部署）
**必须先口头确认再执行。**

- [ ] **Step 3: 线上复查**

部署完成后 Playwright 访问 https://www.chenyunsheep.top ：游客留言、评论、点赞、各页标题、console 无致命错误。

---

## 自审记录

- 规格覆盖：免登录留言（T2-5）、免登录评论（T6-7）、本地环境（T1）、Newsletter（T8）、SEO（T9）、Sanity 清单（T10）、验证发布（T11-12）✅
- 类型一致性：`GuestIdentity.userInfo` 与 `GuestbookDto['userInfo']`/评论 `userInfo` 字段（firstName/lastName/imageUrl 可空）兼容 ✅
- 已知取舍：本地 dev 直连生产 Neon/Redis（vercel env pull 的默认行为），所有集成测试数据在验证后立即删除并在删除前告知站主
