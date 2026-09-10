# Clerk 认证域名迁移记录

## 2026-09-10 已完成配置

- 沿用现有 Clerk 生产实例，将主域名从 `cherishbloom.top` 迁移到 `chenyunsheep.top`，保留用户数据。
- Vercel 的 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 更新为新域名对应的公开密钥（All Environments），未轮换或公开服务端密钥。
- Vercel 的 `NEXT_PUBLIC_SITE_URL` 更新为 `https://www.chenyunsheep.top`（All Environments）。
- 新增生产环境变量 `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` 和 `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`。
- Clerk Paths：首页和退出后地址为 `https://www.chenyunsheep.top`，登录与注册使用博客的 `/sign-in` 和 `/sign-up` 页面。
- Clerk 控制台确认 Frontend API 和 Account portal 的 CNAME 均已验证。

## 待验证依赖

Clerk 邮件记录仍需在阿里云配置以下 CNAME，解析来源为默认：

| 主机记录 | 记录值 |
| --- | --- |
| clkmail | mail.t2fzdthhv6pt.clerk.services |
| clk._domainkey | dkim1.t2fzdthhv6pt.clerk.services |
| clk2._domainkey | dkim2.t2fzdthhv6pt.clerk.services |

配置后在 Clerk 点击 Verify Records，确认邮件验证与 SSL 签发，再验证线上登录注册。更新环境变量必须重新部署后生效。Google/GitHub 等社交登录如果启用，还需核对其 OAuth 回调地址。

本次提交记录控制台配置变更并触发部署，不改动用户手动编写的功能。
