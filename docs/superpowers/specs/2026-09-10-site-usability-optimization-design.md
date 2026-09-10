# 整站功能可用性优化 — 设计文档

日期：2026-09-10
状态：已与站主确认（陈云）

## 背景

站点（www.chenyunsheep.top，Next.js 14 + Sanity + Clerk + Neon + Upstash + Resend，部署于 Vercel）存在四类"功能不可用"问题：

1. Clerk 在国内网络加载不稳，访客无法登录 → 留言墙、评论不可用
2. 仓库无 `.env`，本地 dev server 无法启动
3. Newsletter 订阅/群发链路未验证跑通
4. SEO 细节问题（/training 无标题、/about 标题重复、keywords 泄露模板原作者）+ Sanity 内 14 个模板遗留分类、20+ 模板遗留项目

## 目标与成功标准

- 访客**不登录**即可留言、评论、点赞（国内网络无 Clerk 依赖）
- 站主本地 `npm run dev` 可启动并预览全站
- Newsletter 订阅 → 确认邮件 → 群发全链路实测通过
- SEO 修复上线；Sanity 遗留数据由站主按清单删除后页面复查干净

## 已确认的决策

| 决策点 | 结论 |
|---|---|
| 认证策略 | 访客免登录（昵称）；站长保留 Clerk 登录 /admin |
| 免登录实现 | 轻量合成游客身份，不改表结构、不迁移 |
| 本地密钥 | vercel CLI 登录后 `vercel env pull` |
| Sanity 清理 | 站主在 /studio 自行删除，我提供安全清单 |
| 首页公开邮箱 | 保留 gaolujie26@gmail.com 不动 |

## 模块设计

### 1. 免登录留言墙 + 评论

**API 层**（`/api/guestbook`、`/api/comments/[id]`）：
- 已登录（Clerk）：走现有逻辑不变
- 未登录：请求体需含 `nickname`（zod：1–20 字符，去首尾空白）+ `message`（1–500 字符）
- 合成身份：`userId = "guest:" + hashids.encode(nickname)`，`userInfo = { name: nickname }`（无 image 字段）
- 访客头像：前端本地生成"首字头像"（昵称首字 + 按昵称哈希取色的纯 CSS 圆形），零外部依赖
- 昵称黑名单（防冒充站长）：`陈云、chenyun、chenyun-sheep、admin、站长、博主`（大小写不敏感；命中则 400 提示换昵称）
- 限流：复用 Upstash ratelimit 按 IP 限流（未登录 5 条/10 分钟；登录沿用现值）
- 返回结构与现有保持一致，前端无需大改

**UI 层**（`GuestbookInput`、`Commentable`）：
- 未登录：显示昵称输入框 + DiceBear 头像实时预览（随昵称变化），提交按钮直接可用
- 已登录：保持现状（头像 + 名字）
- Clerk 加载失败时不再阻塞输入（当前实现依赖 Clerk hook，需改为"未初始化=按未登录处理"）

**安全考量**：留言/评论渲染侧已是文本/受控 Markdown（现有组件），昵称仅作展示文本（React 自动转义）；不新增 HTML 注入面。

### 2. 本地开发环境

- `npm i -g vercel`（若未装）
- 站主在会话内执行 `! vercel login` 完成一次浏览器授权
- `vercel link` 关联 chenyun.so 项目 → `vercel env pull .env.local`
- 验证 `.gitignore` 覆盖 `.env.local` → `npm run dev` 全页面走查
- 若个别密钥缺失（如 Resend 未配置），记录并进入模块 3 处理

### 3. Newsletter 链路验证

- 本地实测：页脚订阅表单 → `/api/newsletter` → Resend 发确认邮件 → `/confirm/[token]` → subscribers 落库
- `/admin/newsletters/new` 编写 → 群发 → 收件验证
- Resend 域名未验证时：给出控制台操作指引（DNS 记录），由站主完成
- 链路上发现的 bug 随修

### 4. SEO 修复

- `app/(main)/training/page.tsx`：补 `export const metadata`（title: 培训课程，description 沿用页头文案）
- `app/(main)/about/page.tsx`：metadata title 改为 `关于我`（去掉手写 `| Chenyun` 后缀，避免与布局模板重复）
- `app/layout.tsx`：keywords 移除"郭晓楠,佐玩"，改为"陈云,chenyun-sheep,精益工程师,6S管理,培训,Next.js"
- 首页邮箱按钮：保留不动（已确认）

### 5. Sanity 遗留数据清理（站主操作）

- 我用 Sanity 公开 GROQ API 统计每个分类的已发布文章数、导出项目清单（名称+URL）
- 产出《安全删除清单》：确认零引用的分类可直接删；被真文章引用的分类标注"先改文章分类再删"
- 站主在 `https://www.chenyunsheep.top/studio` 登录删除
- 我浏览器复查 /blog、/projects、首页渲染干净

### 6. 收尾验证与发布

- `npm run lint` + `npm run build` 零错误
- Playwright 本地全功能走查：留言（免登录）、评论、点赞、订阅、admin 登录
- diff 给站主过目 → commit（含站主未提交的 3 个文件：layout.tsx / seo.ts / next.config.mjs）→ **push 前再次确认** → Vercel 自动部署 → 线上复查

## 错误处理

- API 校验失败：400 + 中文友好提示（昵称太长/含敏感词/留言为空）
- 限流触发：429 + "发布太频繁，稍后再试"
- Clerk 未加载：访客路径完全不依赖 Clerk；admin 路径维持 Clerk 报错原样
- Resend 失败：订阅接口已有错误处理，补充日志便于排查

## 测试计划

- 单测/脚本：昵称黑名单、zod 边界（0/1/20/21 字符、空白昵称）
- 集成（本地 dev + Playwright）：免登录留言 → 列表出现；同 IP 超频 → 429；黑名单昵称 → 400
- 回归：登录态留言/评论、点赞、订阅确认流

## 不做的事（YAGNI）

- 不更换认证体系、不重构数据表结构、不写数据迁移
- 不删除 debug 页 / Spline 资源、不翻译 README
- 不新增微信登录等国内 OAuth（需要企业资质，超出本次范围）

## 已知限制

- 国内直连时右上角 Clerk 登录按钮可能仍加载慢/失败（仅影响"主动登录"，不影响访客互动）
- 站长访问 /admin 在国内建议挂代理
