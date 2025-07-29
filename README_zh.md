# 🚀 AI SaaS Template

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be?style=flat-square&logo=trpc)](https://trpc.io/)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-c5f74f?style=flat-square)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**一个现代化、生产就绪的 AI SaaS 应用模板**

基于 Next.js 15 构建，集成了用户认证、支付系统、AI 功能、国际化、文档系统和完整的管理后台。

[🌟 在线演示](https://aisaas.ailinksall.com/zh) | [📖 文档](https://aisaas.ailinksall.com/zh/docs) | [🎯 快速开始](#-快速开始)

</div>

---

## ✨ 核心特性

### 🔐 认证与授权系统
- **多种登录方式**: 邮箱密码、OAuth (Google, GitHub 等)
- **完整认证流程**: 注册、登录、邮箱验证、密码重置、SSO 回调
- **权限管理**: 基于角色的访问控制 (RBAC)，支持管理员权限
- **用户资料管理**: 个人信息编辑、头像上传、技能等级设置
- **安全保护**: 中间件保护路由、会话管理、CSRF 防护

### 💳 支付与订阅系统
- **Stripe 完整集成**: 安全的支付处理和订阅管理
- **多种会员计划**: 月付、年付、企业版等灵活选择
- **优惠券系统**: 百分比折扣、固定金额折扣
- **支付历史**: 完整的交易记录和发票管理
- **多货币支持**: USD、CNY 等多种货币

### 🤖 AI 功能集成
- **多 AI 提供商支持**: OpenAI、Anthropic、Google AI、xAI
- **对话管理**: 智能对话历史和上下文管理
- **提示模板**: 可复用的 AI 提示模板系统
- **使用限制**: 基于会员等级的 AI 使用配额管理
- **API 密钥管理**: 安全的 API 密钥存储和轮换

### 🌍 国际化支持
- **多语言**: 中文、英文，易于扩展更多语言
- **本地化内容**: 完整的内容本地化支持
- **动态语言切换**: 无需刷新页面的语言切换
- **SEO 优化**: 多语言 SEO 和 sitemap 生成

### 📚 文档系统
- **Fumadocs 集成**: 现代化的文档生成和管理
- **MDX 支持**: 支持 React 组件的 Markdown 文档
- **搜索功能**: 全文搜索和智能建议
- **版本控制**: 文档版本管理和历史记录

### 🎨 现代化 UI/UX
- **Shadcn/ui**: 高质量的 UI 组件库
- **响应式设计**: 完美适配桌面、平板、手机
- **主题切换**: 明暗主题无缝切换
- **动画效果**: Framer Motion 驱动的流畅动画
- **无障碍支持**: WCAG 2.1 AA 级别的无障碍设计

### 🛠️ 开发体验
- **TypeScript**: 完整的类型安全和智能提示
- **tRPC**: 端到端类型安全的 API
- **Drizzle ORM**: 现代化的数据库 ORM
- **测试覆盖**: 单元测试、集成测试、E2E 测试
- **代码质量**: ESLint、Prettier、Husky 预提交钩子

### 📊 监控与分析
- **性能监控**: Core Web Vitals 和性能指标
- **错误追踪**: Sentry 集成的错误监控
- **用户分析**: Google Analytics 集成
- **日志系统**: 结构化日志和错误报告

---

## 🏗️ 技术架构

### 前端技术栈
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **UI 组件**: Shadcn/ui + Radix UI
- **状态管理**: React Query + Zustand
- **动画**: Framer Motion
- **表单**: React Hook Form + Zod

### 后端技术栈
- **API**: tRPC 11 (类型安全的 API)
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: Clerk (多种登录方式)
- **支付**: Stripe (订阅和一次性支付)
- **缓存**: Upstash Redis
- **邮件**: Resend / SMTP

### AI 集成
- **OpenAI**: GPT-4, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet
- **Google AI**: Gemini Pro
- **xAI**: Grok

### 部署与运维
- **部署**: Vercel / Docker
- **数据库**: Neon / Supabase / PlanetScale
- **CDN**: Cloudflare
- **监控**: Sentry + 自定义监控
- **CI/CD**: GitHub Actions

---

## 📁 项目结构

```
ai-saas-template/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # 国际化路由
│   │   │   ├── (front)/       # 前台页面
│   │   │   ├── admin/         # 管理后台
│   │   │   ├── auth/          # 认证页面
│   │   │   └── docs/          # 文档页面
│   │   └── api/               # API 路由
│   ├── components/            # React 组件
│   │   ├── auth/              # 认证组件
│   │   ├── payment/           # 支付组件
│   │   ├── ui/                # UI 组件
│   │   ├── blocks/            # 页面区块
│   │   └── layout/            # 布局组件
│   ├── lib/                   # 工具库
│   │   ├── trpc/              # tRPC 配置
│   │   ├── db.ts              # 数据库配置
│   │   ├── stripe.ts          # Stripe 配置
│   │   └── utils.ts           # 工具函数
│   ├── drizzle/               # 数据库
│   │   ├── schemas/           # 数据表定义
│   │   └── migrations/        # 数据库迁移
│   ├── types/                 # TypeScript 类型
│   ├── hooks/                 # React Hooks
│   ├── constants/             # 常量配置
│   ├── translate/             # 国际化
│   └── content/               # 内容文件
│       ├── docs/              # 文档内容
│       └── blog/              # 博客内容
├── public/                    # 静态资源
├── tests/                     # 测试文件
└── scripts/                   # 脚本文件
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18.17+ 
- pnpm 8.0+
- PostgreSQL 14+
- Redis (可选，用于缓存)

### 1. 克隆项目

```bash
git clone https://github.com/geallenboy/ai-saas-template.git
cd ai-saas-template
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 环境配置

复制环境变量模板：

```bash
cp .env.example .env.local
```

配置必需的环境变量：

```bash
# 数据库配置 (必需)
DATABASE_URL="postgresql://username:password@localhost:5432/ai_saas"

# Clerk 认证 (必需)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe 支付 (必需)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI API Keys (至少配置一个)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_GENERATIVE_AI_API_KEY="..."
XAI_API_KEY="..."

# 站点配置
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Redis 缓存 (可选)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# 邮件服务 (可选)
RESEND_API_KEY="re_..."
```

### 4. 数据库设置

生成数据库迁移：

```bash
pnpm db:generate
```

运行数据库迁移：

```bash
pnpm db:migrate
```

初始化系统配置：

```bash
pnpm db:push
```

### 5. 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

---

## 📝 可用脚本

### 开发命令

```bash
pnpm dev          # 启动开发服务器 (Turbo 模式)
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm type-check   # TypeScript 类型检查
```

### 代码质量

```bash
pnpm lint         # 代码检查和自动修复
pnpm lint:check   # 仅检查代码质量
pnpm format       # 代码格式化
pnpm format:check # 检查代码格式
```

### 测试命令

```bash
pnpm test              # 运行所有测试
pnpm test:dev          # 监听模式运行测试
pnpm test:coverage     # 生成测试覆盖率报告
pnpm test:unit         # 运行单元测试
pnpm test:integration  # 运行集成测试
pnpm test:e2e          # 运行端到端测试
```

### 数据库命令

```bash
pnpm db:generate  # 生成数据库迁移文件
pnpm db:migrate   # 运行数据库迁移
pnpm db:push      # 推送 schema 到数据库
pnpm db:studio    # 打开 Drizzle Studio
```

### 质量检查

```bash
pnpm ci                # CI 流水线检查
pnpm quality:check     # 完整质量检查
pnpm quality:fix       # 修复质量问题
```

---

## 🔧 配置指南

### 认证配置

1. 在 [Clerk](https://clerk.com) 创建应用
2. 配置 OAuth 提供商 (Google, GitHub 等)
3. 设置 Webhook 端点: `https://yourdomain.com/api/webhook/clerk`
4. 复制 API 密钥到环境变量

### 支付配置

1. 在 [Stripe](https://stripe.com) 创建账户
2. 配置产品和价格
3. 设置 Webhook 端点: `https://yourdomain.com/api/webhook/stripe`
4. 配置支付方式和货币

### AI 服务配置

选择并配置至少一个 AI 提供商：

- **OpenAI**: 在 [OpenAI Platform](https://platform.openai.com) 获取 API 密钥
- **Anthropic**: 在 [Anthropic Console](https://console.anthropic.com) 获取 API 密钥
- **Google AI**: 在 [Google AI Studio](https://aistudio.google.com) 获取 API 密钥
- **xAI**: 在 [xAI Console](https://console.x.ai) 获取 API 密钥

### 数据库配置

支持多种 PostgreSQL 提供商：

- **Neon**: 无服务器 PostgreSQL
- **Supabase**: 开源 Firebase 替代品
- **PlanetScale**: MySQL 兼容的无服务器数据库
- **Railway**: 简单的云数据库
- **本地 PostgreSQL**: 开发环境使用

---

## 🚀 部署指南

### Vercel 部署 (推荐)

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 部署应用

```bash
# 使用 Vercel CLI
npx vercel --prod
```

### Docker 部署

```bash
# 构建镜像
docker build -t ai-saas-template .

# 运行容器
docker run -p 3000:3000 --env-file .env.local ai-saas-template
```

### 环境变量检查清单

部署前确保配置以下环境变量：

- [ ] `DATABASE_URL` - 数据库连接字符串
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk 公钥
- [ ] `CLERK_SECRET_KEY` - Clerk 私钥
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe 公钥
- [ ] `STRIPE_SECRET_KEY` - Stripe 私钥
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe Webhook 密钥
- [ ] 至少一个 AI API 密钥
- [ ] `NEXT_PUBLIC_SITE_URL` - 站点 URL

---

## 🧪 测试

### 测试策略

项目采用多层次测试策略：

- **单元测试**: 测试独立的函数和组件
- **集成测试**: 测试组件间的交互
- **E2E 测试**: 测试完整的用户流程

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:dev

# 生成覆盖率报告
pnpm test:coverage

# 运行特定测试
pnpm test auth.test.ts
```

### 测试覆盖率目标

- 整体覆盖率: ≥ 80%
- 核心业务逻辑: ≥ 90%
- 工具函数: ≥ 95%

---

## 🔒 安全最佳实践

### 认证安全
- 使用 HTTPS 传输
- 实施 CSRF 保护
- 会话超时管理
- 多因素认证支持

### 数据安全
- 敏感数据加密存储
- SQL 注入防护
- XSS 攻击防护
- 输入验证和清理

### API 安全
- 速率限制
- API 密钥轮换
- 请求签名验证
- 错误信息脱敏

---

## 📈 性能优化

### 前端优化
- 代码分割和懒加载
- 图片优化和 WebP 格式
- 静态资源 CDN 加速
- Service Worker 缓存

### 后端优化
- 数据库查询优化
- Redis 缓存策略
- API 响应压缩
- 连接池管理

### 监控指标
- Core Web Vitals
- 首屏加载时间 (FCP)
- 最大内容绘制 (LCP)
- 累积布局偏移 (CLS)

---

## 🤝 贡献指南

### 开发流程

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 编写测试覆盖新功能
- 更新相关文档

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复问题
docs: 更新文档
style: 代码格式调整
refactor: 代码重构
test: 添加测试
chore: 构建过程或辅助工具的变动
```

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

## 🙏 致谢

感谢以下开源项目和服务：

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [tRPC](https://trpc.io/) - 类型安全的 API
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Clerk](https://clerk.com/) - 认证服务
- [Stripe](https://stripe.com/) - 支付处理
- [Fumadocs](https://fumadocs.vercel.app/) - 文档生成

---

## 📞 支持

如果您在使用过程中遇到问题，可以通过以下方式获取帮助：

- 📧 邮箱: [gejialun88@gmail.com](mailto:gejialun88@gmail.com)
- 💬 个人网站: [gegarron](https://gegarron.com)
- 🐛 问题反馈: [GitHub Issues](https://github.com/geallenboy/ai-saas-template/issues)
- 💬 讨论交流: [GitHub Discussions](https://github.com/geallenboy/ai-saas-template/discussions)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

[⬆ 回到顶部](#-ai-saas-template)

</div>