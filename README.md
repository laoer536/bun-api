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
    "workspaces": ["apps/*"],
    "trustedDependencies": ["@prisma/client", "@prisma/engines", "prisma"],
    "scripts": {
      "dev": "bun --filter '*' dev",
      "build": "bun --filter '*' build",
      "lint": "bun --filter '*' lint",
      "frontend": "bun run --filter frontend",
      "backend": "bun run --filter bun-api",
      "prisma:new": "bun backend prisma:new",
      "prisma:pull": "bun backend prisma:pull",
      "prisma:push": "bun backend prisma:push"
    },
    "dependencies": {},
    "devDependencies": {
      "prettier": "^3.2.5"
    }
  }
  ```

- Backend

```ts
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'

import { authorityService, userService } from './services'

const app = new Elysia()
  .use(cors({ origin: false })) // Why is 'origin: false'? Because we have configured a proxy locally for front-end development, we have set up a reverse proxy for NGINX deployed online.
  .use(swagger())
  .use(authorityService)
  .use(userService)
  .listen(8090)

export type App = typeof app
```

- Frontend

  lib/server.ts

```ts
import { treaty } from '@elysiajs/eden'
import type { App } from 'bun-api'
const server = treaty<App>(import.meta.env.VITE_API_BASE_URL, {
  headers: [() => ({ authorization: `Bearer ${localStorage.getItem('token')}` })],
  onResponse: (res) => {
    if (!res.ok) {
      // do something
    }
  },
})
export default server
```

Use

```tsx
import server from '@/lib/server'

// in react
const login = useCallback(async () => {
  if (verificationCode) {
    const { data, error } = await server.authority.login.post({ email: email, randomCode: verificationCode })
    if (!error) {
      localStorage.setItem('token', data)
      console.log('Login successful!')
      location.reload()
    } else {
      console.log(`Login failed with the error message is ${error.value}.`)
    }
  } else {
    console.log('Please enter a verification code!')
  }
}, [verificationCode, email])
```

## Set your environment variables

```dotenv
DATABASE_URL=postgresql://root:password123@localhost:5432/bun-api
# need change
JWT_SECRETS=xxxxxxxxx

# You need to go to the corresponding platform mailbox to enable SMTP acquisition
# See the file at "utils/nodemailer.ts"
# need change
NODEMAILER_AUTH_EMAIL=xxxxxx
# need change
NODEMAILER_AUTH_PASS=xxxxxx

REDIS_HOST = localhost
REDIS_PORT = 6379
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
