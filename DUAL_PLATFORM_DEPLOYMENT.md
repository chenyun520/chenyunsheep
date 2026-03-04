# 双平台部署方案

## 🎯 推荐方案：Vercel + Cloudflare

### 架构说明
```
用户 → Cloudflare CDN (DNS/CDN/缓存) → Vercel (应用服务器)
                                              ↓
                                         Clerk (认证)
                                         Sanity (CMS)
                                         Neon (数据库)
```

### 优势
- ✅ **Vercel**: 完整的 Next.js 支持，包括 Edge Runtime、API Routes、SSR
- ✅ **Cloudflare**: 全球 CDN 加速、DDoS 防护、免费 SSL
- ✅ **国内访问**: Cloudflare 的 CDN 在国内可访问
- ✅ **无额外成本**: 两个平台的免费套餐足够使用

## 📋 配置步骤

### 1. Cloudflare DNS 设置（5分钟）

1. 登录 Cloudflare Dashboard: https://dash.cloudflare.com
2. 添加你的域名 `cali.so`
3. 在域名注册商处将 nameserver 改为 Cloudflare 的：
   ```
   amy.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```

### 2. 配置 DNS 记录

在 Cloudflare DNS 设置中添加：

```
类型: A
名称: @
内容: 76.76.21.21 (Vercel 的 IP)
代理: 已启用 (橙色云朵)

类型: CNAME
名称: www
内容: cali.so
代理: 已启用 (橙色云朵)

类型: TXT
名称: _vercel
内容: vercel-domain-verification=你的验证码
```

### 3. 在 Vercel 添加自定义域名

1. 登录 Vercel: https://vercel.com
2. 进入项目设置 → Domains
3. 添加 `cali.so`
4. Vercel 会自动配置 SSL

### 4. 配置 Cloudflare 页面规则（可选）

在 Cloudflare Dashboard → Rules → Page Rules 添加：

```
URL: cali.so/api/*
设置: 缓存级别: 绕过 (API 路由不缓存)

URL: cali.so/_next/*
设置: 缓存级别: 标准

URL: cali.so/static/*
设置: 缓存级别: 标准，浏览器缓存时间: 1年
```

### 5. 配置 Cloudflare 缓存规则（推荐）

在 Cloudflare Dashboard → Rules → Cache Rules 添加：

```
规则名称: Next.js 静态资源
匹配: (http.host eq "cali.so") and (uri.path matches "/_next/static/*" or uri.path matches "/static/*")
操作: 缓存，浏览器缓存 TTL: 1年，边缘缓存 TTL: 1个月

规则名称: API 路由
匹配: (http.host eq "cali.so") and uri.path matches "/api/*"
操作: 绕过缓存
```

## 🔧 环境变量配置

### Vercel 环境变量（保持不变）
```
NEXT_PUBLIC_SANITY_PROJECT_ID=06ixdv8f
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Cloudflare 环境变量
**不需要配置** - Cloudflare 只作为 CDN，不运行应用代码

## 🚀 部署流程

### Vercel（主部署）
1. 推送代码到 GitHub
2. Vercel 自动部署
3. ✅ 完整功能可用

### Cloudflare（自动生效）
1. DNS 自动指向 Vercel
2. Cloudflare CDN 自动缓存静态资源
3. ✅ 全球加速 + 国内可访问

## 📊 对比

| 特性 | Vercel | Cloudflare Pages | 本方案 |
|------|--------|-----------------|--------|
| Next.js 支持 | ✅ 完美 | ⚠️ 受限 | ✅ 完美 |
| Edge Runtime | ✅ 支持 | ⚠️ 部分支持 | ✅ 支持 |
| API Routes | ✅ 支持 | ❌ 不支持 | ✅ 支持 |
| SSR/SSG | ✅ 支持 | ⚠️ 仅 SSG | ✅ 支持 |
| Clerk | ✅ 支持 | ❌ 需修改 | ✅ 支持 |
| Upstash | ✅ 支持 | ❌ 不支持 | ✅ 支持 |
| 国内访问 | ❌ 被屏蔽 | ✅ 可访问 | ✅ 可访问 |
| CDN | ✅ 全球 | ✅ 全球 | ✅ 全球 |
| 成本 | ✅ 免费 | ✅ 免费 | ✅ 免费 |

## 🎁 额外好处

1. **更快的速度**: Cloudflare CDN 覆盖 200+ 城市
2. **更好的安全性**: DDoS 防护、WAF 规则
3. **更灵活的控制**: Cloudflare Workers 可以添加自定义逻辑
4. **零停机切换**: 随时可以在 Vercel 和其他平台间切换

## 🔍 验证部署

### 检查 DNS
```bash
dig cali.so
# 应该显示 Cloudflare 的 IP
```

### 检查 SSL
```bash
curl -I https://cali.so
# 应该显示 200 OK 和有效的 SSL 证书
```

### 检查缓存
访问网站后，在 Cloudflare Dashboard → Cache → Analytics 查看命中率

## 🆘 故障排查

### 问题 1: 网站无法访问
- 检查 DNS 设置是否正确
- 检查 Cloudflare 代理是否开启（橙色云朵）
- 清除浏览器缓存

### 问题 2: API 路由不工作
- 检查 Vercel 部署是否成功
- 检查 Cloudflare 缓存规则是否绕过 API

### 问题 3: 登录不工作
- 检查 Clerk 环境变量
- 检查 Vercel 日志

## 📝 总结

这个方案让你：
- ✅ **保留 Vercel 的所有功能**
- ✅ **获得 Cloudflare 的国内访问能力**
- ✅ **无需修改代码**
- ✅ **零额外成本**
- ✅ **零运维复杂度**

这是目前最实用的双平台部署方案！
