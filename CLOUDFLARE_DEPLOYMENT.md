# Cloudflare Pages 部署指南

## 迁移到 Cloudflare Pages

### 方法一：直接连接 GitHub（推荐）

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com
   - 进入 "Pages" 页面

2. **创建新项目**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权访问你的 GitHub 账号
   - 选择 `chenyun520/cali.so` 仓库

3. **配置构建设置**
   ```
   Build command: pnpm turbo build
   Build output directory: .next
   Root directory: (留空)
   ```

4. **配置环境变量**
   在 Settings → Environment variables 中添加：
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=06ixdv8f
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=你的key
   CLERK_SECRET_KEY=你的secret
   DATABASE_URL=你的数据库URL
   UPSTASH_REDIS_REST_URL=你的URL
   UPSTASH_REDIS_REST_TOKEN=你的token
   ```

5. **配置自定义域名**
   - 在项目设置中添加 `cali.so`
   - 按照 Cloudflare 指引配置 DNS 记录

### 方法二：使用 Wrangler CLI

1. **安装 Wrangler**
   ```bash
   pnpm add -D wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   npx wrangler login
   ```

3. **构建项目**
   ```bash
   pnpm run build
   ```

4. **部署**
   ```bash
   npx wrangler pages deploy .next --project-name=cali-so
   ```

### 方法三：使用 GitHub Actions

1. **获取 Cloudflare API Token**
   - Cloudflare Dashboard → My Profile → API Tokens
   - 创建 "Edit Cloudflare Workers" token

2. **获取 Account ID**
   - 在 Cloudflare Dashboard 右侧可以看到

3. **配置 GitHub Secrets**
   在 GitHub 仓库设置中添加：
   ```
   CLOUDFLARE_API_TOKEN=你的token
   CLOUDFLARE_ACCOUNT_ID=你的account_id
   SANITY_PROJECT_ID=06ixdv8f
   SANITY_DATASET=production
   CLERK_PUBLISHABLE_KEY=你的key
   CLERK_SECRET_KEY=你的secret
   DATABASE_URL=你的数据库URL
   UPSTASH_REDIS_REST_URL=你的URL
   UPSTASH_REDIS_REST_TOKEN=你的token
   ```

4. **推送代码自动部署**
   ```bash
   git push origin main
   ```

## DNS 配置

### 在 Cloudflare DNS 中添加记录：

```
类型: A
名称: cali
内容: (Cloudflare 会自动分配)
代理: 已启用 (橙色云朵)

类型: CNAME
名称: www
内容: cali.so
代理: 已启用
```

## 从 Vercel 迁移的注意事项

1. **环境变量迁移**
   - 从 Vercel 项目设置中复制所有环境变量
   - 在 Cloudflare Pages 中重新配置

2. **域名迁移**
   - 在域名注册商处将 nameserver 改为 Cloudflare
   - 在 Cloudflare 中添加域名
   - 添加 DNS 记录指向 Cloudflare Pages

3. **数据库和服务**
   - Neon、Upstash 等服务无需修改
   - 只需确保环境变量正确配置

4. **Clerk 认证**
   - 需要在 Clerk Dashboard 中添加新的授权域名
   - 更新 Allowed Origins

## 部署后验证

- [ ] 网站可以正常访问
- [ ] 用户认证功能正常
- [ ] 博客文章正常加载
- [ ] Sanity CMS 内容正常显示
- [ ] 所有 API 路由正常工作

## 回滚方案

如果出现问题，可以：
1. 重新部署到 Vercel
2. 将 DNS 指回 Vercel
3. 排查 Cloudflare 部署问题
