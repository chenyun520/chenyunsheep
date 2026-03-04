# Cloudflare Pages 快速部署指南

## 🚀 最简单的部署方法

由于你的项目使用了 `@cloudflare/next-on-pages`，**最好的方式是让 Cloudflare Pages 直接从 GitHub 自动构建和部署**。

### 第一步：推送代码到 GitHub ✅
代码已经在 GitHub 上了：`chenyun520/cali.so`

### 第二步：在 Cloudflare 创建项目

1. 访问 https://dash.cloudflare.com
2. 点击 **"Workers & Pages"**
3. 点击 **"Create application"**
4. 选择 **"Pages"** → **"Connect to Git"**
5. 授权 GitHub 并选择 `chenyun520/cali.so` 仓库

### 第三步：配置构建设置

在 Cloudflare Pages 设置页面填写：

| 设置项 | 值 |
|--------|-----|
| **Project name** | `cali-so` (或任意名称) |
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Build command** | `npx @cloudflare/next-on-pages@1` |
| **Build output directory** | `.vercel/output/static` |
| **Root directory** | (留空) |
| **Node.js version** | `20` |

### 第四步：配置环境变量

在 **"Environment variables"** 部分添加：

```
NEXT_PUBLIC_SANITY_PROJECT_ID=06ixdv8f
NEXT_PUBLIC_SANITY_DATASET=production
```

然后从 Vercel 复制其他环境变量：

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### 第五步：部署

1. 点击 **"Save and Deploy"**
2. Cloudflare 会自动构建和部署
3. 几分钟后你将获得一个 `*.pages.dev` 域名

### 第六步：配置自定义域名

1. 在项目页面点击 **"Custom domains"**
2. 添加 `cali.so`
3. 按照 Cloudflare 的指引配置 DNS

## 📝 注意事项

### Windows 用户
- 由于 `@cloudflare/next-on-pages` 在 Windows 上有兼容性问题
- **建议直接在 Cloudflare Pages 上构建**，而不是本地构建
- Cloudflare 的构建环境是 Linux，不会有这个问题

### 构建输出目录
- Cloudflare Pages 会自动使用 `.vercel/output/static` 目录
- 这是 `@cloudflare/next-on-pages` 的默认输出目录
- **不需要手动修改**

### 环境变量位置
- **生产环境变量**：Settings → Environment variables → Production
- **预览环境变量**：Settings → Environment variables → Preview
- **所有环境变量**：Settings → Environment variables → All environments

## 🔍 故障排查

### 构建失败
1. 检查构建日志中的错误信息
2. 确保所有环境变量都已配置
3. 检查 Node.js 版本是否设置为 20+

### 部署成功但网站无法访问
1. 检查 DNS 设置是否正确
2. 清除浏览器缓存
3. 等待 DNS 传播（可能需要几分钟）

### 某些功能不工作
1. 检查 Edge Runtime 兼容性
2. 某些 Node.js API 在 Cloudflare Workers 中不可用
3. 查看控制台错误信息

## 🎉 完成

部署成功后，你的网站将在：
- Cloudflare Pages 域名：`https://cali-so.pages.dev`
- 自定义域名：`https://cali.so`

国内用户将能够正常访问你的网站！
