import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { swaggerPlugin } from './plugin/swagger'
import { authorityService, userService } from './services'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = new Elysia()
  .use(cors({ origin: false })) // Why is 'origin: false'? Because we have configured a proxy locally for front-end development, we have set up a reverse proxy for NGINX deployed online.
  .use(swaggerPlugin)
  .use(authorityService)
  .use(userService)
  .listen(8090)

export type App = typeof app
