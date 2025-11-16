import { Elysia } from 'elysia'

import { AuthPlugin } from '../../plugin/auth'
import { UserModel } from './model.ts'
import { UserService } from './service.ts'

export const userService = new Elysia({ tags: ['User'] }).use(AuthPlugin).get(
  '/user',
  async (ctx) => {
    const userInfo = ctx.userInfo // The ‘auth’ plugin has processed the situation where userInfo is not available.
    console.log(userInfo)
    return UserService.getUsers()
  },
  {
    response: {
      200: UserModel.users,
    },
  },
)
