# Elysia with Bun runtime


## Why use bun and Elysia

[Performance](https://elysiajs.com/at-glance.html#performance)

Building on Bun and extensive optimization like Static Code Analysis allows Elysia to generate optimized code on the fly.

Elysia can outperform most of the web frameworks available today[[1\]](https://elysiajs.com/at-glance.html#ref-1), and even match the performance of Golang and Rust framework[[2\]](https://elysiajs.com/at-glance.html#ref-2).

| Framework     | Runtime | Average     | Plain Text | Dynamic Parameters | JSON Body  |
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

![2024-05-06 12.51.00.png](https://s2.loli.net/2024/05/06/1TDsQYSHNvngmw9.png)

## Api docs

![_6-7-2024_2148_localhost.jpeg](https://s2.loli.net/2024/07/06/POZSw2aNh1D8LQY.jpg)

## Frontend web

![2024-10-14 00.02.46.png](https://s2.loli.net/2024/10/14/iYnoLk8QFrzuOs1.png)

## Full stack development

- Bun workspaces

  Project structure

  ```
  .
  ├── package.json
  ├── node_modules
  └── apps
    ├── frontend
    │   └── package.json
    └── backend
        └── package.json
  ```

  Configuration is required for Workspace to take effect

  ```json
  {
    "name": "fullstack-for-bun-api",
    "version": "1.0.50",
    "workspaces": [
      "apps/**"
    ],
    "trustedDependencies": [
      "@prisma/client",
      "@prisma/engines",
      "prisma"
    ],
    "scripts": {
      "dev": "bun --filter '*' dev",
      "build": "bun --filter '*' build",
      "lint": "bun --filter '*' lint",
      "frontend": "bun --filter frontend",
      "frontend:build": "bun frontend build",
      "backend": "bun --filter backend",
      "backend:docker-build": "bun backend build:docker",
      "prisma:new": "bun backend prisma:new",
      "prisma:pull": "bun backend prisma:pull",
      "prisma:push": "bun backend prisma:push",
      "prisma:deploy": "bun backend prisma:deploy",
      "prisma:migrate": "bun backend prisma:migrate",
      "prisma:generate": "bun backend prisma:generate",
      "docker:dev": "docker-compose up -d",
      "docker:deploy": "docker-compose -f docker-compose-deploy.yml up -d --build"
    },
    "devDependencies": {
      "prettier": "^3.2.5"
    }
  }
  ```

- Backend

```ts
import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { openaiPlugin } from './plugin/openai'
import { authorityService, userService } from './services'

export const app = new Elysia()
  .use(cors({ origin: false })) // Why is 'origin: false'? Because we have configured a proxy locally for front-end development, we have set up a reverse proxy for NGINX deployed online.
  .use(openaiPlugin)
  .use(authorityService)
  .use(userService)
  .listen(8090)

export type App = typeof app
export * from './types/models.ts'
```

- Frontend

  lib/server.ts

```ts
import { treaty } from '@elysiajs/eden'
import type { App } from 'bun-api'
import { toast } from 'sonner'

const server = treaty<App>(import.meta.env.VITE_API_BASE_URL, {
  headers: [() => ({ authorization: `Bearer ${localStorage.getItem('token')}` })],
  onResponse: async (res) => {
    if (!res.ok) {
      const text = await res.text()
      const status = res.status.toString()
      toast.error(status, {
        description: text,
        position: 'top-center',
      })
    }
  },
})
export { server }
```

Use

```tsx
import server from '@/lib/server'

// in frontend
const { data: token, error } = await server.authority.login.post({ email, verificationCode })
      
if (!error) {
   localStorage.setItem('token', token)
   location.reload()
}
```

## Set your environment variables

`env.docker`

`apps/backend/.env`

`apps/frontend/.env`

> The development environment needs to set the environment variable file in the corresponding project
>

```dotenv
# env.docker
# common
NODE_ENV='production'

# Backend
DATABASE_URL=postgresql://postgres:password123@postgres:5432/bun-app
JWT_SECRETS=xxxxx
#You need to go to the corresponding platform email address to enable SMTP acquisition
NODEMAILER_AUTH_EMAIL=xxxx
NODEMAILER_AUTH_PASS=xxxxx
REDIS_HOST=redis
REDIS_PORT=6379

# Frontend
# nginx work
VITE_API_BASE_URL='http://localhost:5173/api'
VITE_PUBLIC_PATH='/'
```

## Development

To start the development server run:

```docker
docker-compose up -d
```

```shell
bun run prisma:push
```

```shell
bun run dev
```

## Deploy app

```shell
bun run docker:deploy
```

or

```shell
docker-compose -f docker-compose-deploy.yml up -d --build
```

Open http://localhost:5173/ with your browser to see the `frontend` project.

Open http://localhost:8090/ with your browser to see the `backend` project.

Open http://localhost:8090/v1-openai with your browser to see the interface documentation.
