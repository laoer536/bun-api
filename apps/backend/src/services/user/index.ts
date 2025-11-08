import { Elysia } from 'elysia'

import { connection } from '../../collection/mysql'
import { AuthPlugin } from '../../plugin/auth'

export const userService = new Elysia({ tags: ['User'] }).use(AuthPlugin).get('/user', async (ctx) => {
  const userInfo = ctx.userInfo // The ‘auth’ plugin has processed the situation where userInfo is not available.
  console.log(userInfo)
  return connection.user.findMany()
})
