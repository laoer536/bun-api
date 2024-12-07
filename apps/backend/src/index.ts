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
