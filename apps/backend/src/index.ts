import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { openaiPlugin } from './plugin/openai'
import { authority, user } from './modules'

export const app = new Elysia()
  .use(cors({ origin: false })) // Why is 'origin: false'? Because we have configured a proxy locally for front-end development, we have set up a reverse proxy for NGINX deployed online.
  .use(openaiPlugin)
  .use(authority)
  .use(user)
  .listen(8090)

export type App = typeof app
export * from './types/models.ts'
