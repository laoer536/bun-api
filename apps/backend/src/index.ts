import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { openapiPlugin } from './plugin/openapi'
import { authority, user } from './modules'
import { betterAuthPlugin } from './plugin/better-auth'

export const app = new Elysia()
  .use(cors({ origin: false })) // Why is 'origin: false'? Because we have configured a proxy locally for front-end development, we have set up a reverse proxy for NGINX deployed online.
  .use(betterAuthPlugin)
  .use(openapiPlugin)
  .use(authority)
  .use(user)
  .listen(8090)

export type App = typeof app
export * from './types/models.ts'
