import { Elysia } from 'elysia'

import { UserService } from './service.ts'
import { UserModel } from './model.ts'

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
