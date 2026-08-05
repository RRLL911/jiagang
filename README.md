# 唐山嘉港环保科技有限公司官网

适配 Cloudflare Pages + Cloudflare D1 的企业官网项目，包含前端页面、管理后台与后端 API。

## 项目结构

```
jiagang-website/
├── index.html                 # 入口重定向页
├── pages/                     # 前端页面
│   ├── index.html             # 首页
│   ├── about.html             # 关于我们
│   ├── products.html          # 产品中心
│   ├── product-detail.html    # 产品详情
│   ├── news.html              # 技术资讯
│   ├── contact.html           # 联系我们
│   ├── admin-login.html       # 管理登录
│   └── admin-dashboard.html   # 管理仪表盘
├── functions/                 # Cloudflare Pages Functions
│   ├── _shared.js             # 共享工具（JWT 验证等）
│   ├── api/contact.js         # 留言提交接口
│   └── admin/api/             # 管理后台接口
│       ├── login.js
│       ├── stats.js
│       └── contacts/[[id]].js
├── colors_and_type.css        # 品牌配色与字体
├── schema.sql                 # D1 数据库结构
├── wrangler.toml              # Wrangler 配置
├── _routes.json               # Pages 路由规则
└── package.json
```

## 本地开发

1. 安装依赖：
   ```bash
   npm install
   ```

2. 创建本地 D1 数据库（首次）：
   ```bash
   npx wrangler d1 create jiagang-db
   # 将返回的 database_id 填入 wrangler.toml
   ```

3. 初始化数据库表：
   ```bash
   npm run db:migrate
   ```

4. 启动本地预览：
   ```bash
   npm run dev
   ```

## 部署到 Cloudflare

1. 登录 Wrangler 并授权：
   ```bash
   npx wrangler login
   ```

2. 创建生产 D1 数据库并迁移：
   ```bash
   npx wrangler d1 create jiagang-db --remote
   # 更新 wrangler.toml 中的 database_id
   npm run db:migrate:prod
   ```

3. 设置 JWT 密钥（强烈建议，避免使用默认值）：
   ```bash
   npx wrangler pages secret put JWT_SECRET
   ```

4. 部署：
   ```bash
   npm run deploy
   ```

## 默认管理员

- 用户名：`admin`
******
首次登录时，系统会自动在 D1 中创建默认管理员账户。生产环境请务必修改默认密码（目前可通过删除 `admins` 表中对应记录并重新登录生成新密码，或后续扩展密码修改接口）。

## 自定义内容

- 修改 `pages/` 下的 HTML 文件更新页面内容
- 修改 `colors_and_type.css` 调整品牌色
- 修改 `wrangler.toml` 中的 `database_id` 指向你的 D1 数据库
