import { Elysia } from 'elysia'

import { UserService } from './service'
import { UserModel } from './model'

export const user = new Elysia({ tags: ['User'] }).get(
  '/users',
  async () => {
    return UserService.getUsers()
  },
  {
    response: {
      200: UserModel.users,
    },
  },
)
