# Bun & Elysia 全栈应用模板

![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)
![Elysia](https://img.shields.io/badge/Elysia-JS-23c4e7?style=for-the-badge)
![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

[English Documentation](./README.md)

这是一个基于现代 **Bun** 运行时构建的高性能全栈 Web 应用模板。本项目利用 **ElysiaJS** 提供极速的后端服务，并结合 **React** (通过 Vite) 构建响应式前端，所有代码均在 **Bun Workspace** 单一代码库（Monorepo）结构中进行管理。

## 🚀 为什么选择 Bun 和 Elysia?

**[性能](https://elysiajs.com/at-glance.html#performance)**

基于 Bun 构建并利用静态代码分析等广泛优化，Elysia 能够即时生成优化后的代码。Elysia 的性能优于目前大多数可用的 Web 框架，甚至可以媲美 Golang 和 Rust 框架。

| 框架          | 运行时  | 平均值      | 纯文本      | 动态参数       | JSON 体    |
| :------------ | :------ | :---------- | :--------- | :----------------- | :--------- |
| bun           | bun     | 262,660.433 | 326,375.76 | 237,083.18         | 224,522.36 |
| elysia        | bun     | 255,574.717 | 313,073.64 | 241,891.57         | 211,758.94 |
| hyper-express | node    | 234,395.837 | 311,775.43 | 249,675            | 141,737.08 |
| hono          | bun     | 203,937.883 | 239,229.82 | 201,663.43         | 170,920.4  |
| h3            | node    | 96,515.027  | 114,971.87 | 87,935.94          | 86,637.27  |
| oak           | deno    | 46,569.853  | 55,174.24  | 48,260.36          | 36,274.96  |
| fastify       | bun     | 65,897.043  | 92,856.71  | 81,604.66          | 23,229.76  |
| fastify       | node    | 60,322.413  | 71,150.57  | 62,060.26          | 47,756.41  |
| koa           | node    | 39,594.14   | 46,219.64  | 40,961.72          | 31,601.06  |
| express       | bun     | 29,715.537  | 39,455.46  | 34,700.85          | 14,990.3   |
| express       | node    | 15,913.153  | 17,736.92  | 17,128.7           | 12,873.84  |

![性能对比](https://s2.loli.net/2024/05/06/1TDsQYSHNvngmw9.png)

## 🛠️ 技术栈

- **运行时**: [Bun](https://bun.sh/)
- **后端框架**: [ElysiaJS](https://elysiajs.com/)
- **前端框架**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **数据库**: PostgreSQL + [Prisma](https://www.prisma.io/)
- **缓存**: Redis
- **样式**: [Tailwind CSS](https://tailwindcss.com/)

## 📂 项目结构

本项目使用 **Bun Workspaces** 来管理 Monorepo。

```
.
├── apps
│   ├── backend     # ElysiaJS API 服务器
│   └── frontend    # React + Vite 客户端
├── docker-compose.yml
├── package.json
└── README.md
```

## 💻 后端开发

### 架构规范

后端遵循 **Controller-Service-Model** 架构：

- **Model (`model.ts`)**: 定义数据结构、验证模式（Elysia `t`）和响应类型。
- **Service (`service.ts`)**: 业务逻辑和数据库交互（Prisma）。
- **Controller (`index.ts`)**: API 路由和处理程序。

### CRUD 生成

使用生成器脚本为 Prisma 模型创建样板代码：

```bash
bun run scripts/generate-crud.ts <ModelName> [OtherModelName ...]
```

**示例:**
```bash
bun run scripts/generate-crud.ts Post
```
这将在 `src/modules/post` 中创建 `model.ts`, `service.ts`, 和 `index.ts`。

## 🎨 前端开发

### API 集成

前端使用 **[Eden Treaty](https://elysiajs.com/eden/treaty.html)** 实现端到端类型安全。

**设置 (`lib/server.ts`):**
```typescript
import { treaty } from '@elysiajs/eden'
import type { App } from 'backend'

const server = treaty<App>(import.meta.env.VITE_API_BASE_URL, {
  headers: [() => ({ authorization: `Bearer ${localStorage.getItem('token')}` })],
  // ... 错误处理
})
export { server }
```

**使用:**
```tsx
import { server } from '@/lib/server'
// ... 在组件内部
const { data, error } = await server.user.profile.get()
```

## 📸 截图

### API 文档
![Swagger UI](https://s2.loli.net/2024/07/06/POZSw2aNh1D8LQY.jpg)
*访问地址: [http://localhost:8090/v1-openai](http://localhost:8090/v1-openai)*

### 前端页面
![前端首页](https://s2.loli.net/2024/10/14/iYnoLk8QFrzuOs1.png)

## 🏁 快速开始

### 前置要求
- [Bun](https://bun.sh/) (v1.0.0+)
- [Docker](https://www.docker.com/) & Docker Compose

### 安装

1.  **克隆与安装**
    ```bash
    git clone https://github.com/laoer536/bun-api
    cd bun-api
    bun install
    ```

2.  **环境设置**
    将 `.env.example` 复制为 `apps/backend` 和 `apps/frontend` 中的 `.env`。

    **`.env.docker` 配置 (生产环境/Docker)**
    ```dotenv
    # common
    NODE_ENV='production'

    # Backend
    DATABASE_URL=postgresql://postgres:password123@postgres:5432/bun-app
    JWT_SECRETS=xxxxx
    # SMTP 配置
    NODEMAILER_AUTH_EMAIL=xxxx
    NODEMAILER_AUTH_PASS=xxxxx
    REDIS_HOST=redis
    REDIS_PORT=6379

    # Frontend
    VITE_API_BASE_URL='http://localhost:5173/api'
    VITE_PUBLIC_PATH='/'
    ```

3.  **启动基础设施**
    ```bash
    docker-compose up -d
    bun run prisma:push
    ```

### 开发
同时启动前端和后端：
```bash
bun run dev
```
- 前端: [http://localhost:5173](http://localhost:5173)
- 后端: [http://localhost:8090](http://localhost:8090)
- API 文档: [http://localhost:8090/v1-openai](http://localhost:8090/v1-openai)

## ▶ 脚本

在根目录下运行这些命令：

### 通用

| 命令 | 描述 |
| :--- | :--- |
| `bun run dev` | 在开发模式下同时启动前端和后端 |
| `bun run build` | 为生产环境构建前端和后端 |
| `bun run lint` | 对所有包进行 Lint 检查 |

### 前端

| 命令 | 描述 |
| :--- | :--- |
| `bun run frontend` | 定位到前端工作区 (用于执行该工作区内的命令) |
| `bun run frontend:build` | 仅构建前端 |

### 后端

| 命令 | 描述 |
| :--- | :--- |
| `bun run backend` | 定位到后端工作区 (用于执行该工作区内的命令) |
| `bun run backend:docker-build` | 构建后端 Docker 镜像 |
| `bun run crud` | 运行 CRUD 生成脚本 (`generate-crud.ts` 的别名) |

### 数据库 (Prisma)

| 命令 | 描述 |
| :--- | :--- |
| `bun run prisma:push` | 将 Prisma schema 状态推送到数据库 (原型设计) |
| `bun run prisma:pull` | 从现有数据库拉取 schema |
| `bun run prisma:generate` | 根据 schema 生成 Prisma Client |
| `bun run prisma:migrate` | 从 Prisma schema 更改创建迁移，应用到数据库，触发生成器 |
| `bun run prisma:deploy` | 将待处理的迁移应用到数据库 (生产环境) |
| `bun run prisma:new` | 创建一个新的迁移文件而不应用它 |

### Docker

| 命令 | 描述 |
| :--- | :--- |
| `bun run docker:dev` | 使用 Docker Compose 启动开发基础设施 (PostgreSQL, Redis) |
| `bun run docker:deploy` | 使用 Docker Compose 部署全栈应用 |

## 🐳 部署

使用 Docker Compose 部署：

```bash
bun run docker:deploy
# 或者
docker-compose -f docker-compose-deploy.yml up -d --build
```

## 📄 许可证

MIT License
