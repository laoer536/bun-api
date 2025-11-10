import { bearer } from '@elysiajs/bearer'
import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'

import { connection } from '../collection/mysql'

export const AuthPlugin = new Elysia({ name: 'auth' })
  .use(bearer())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRETS!,
    }),
  )
  .derive({ as: 'scoped' }, async ({ bearer, jwt, status }) => {
    const payload = (await jwt.verify(bearer).catch(() => null)) as { email: string } | null
    if (!payload?.email) return status(401, 'Login required')
    const userInfo = await connection.user.findUnique({ where: { email: payload.email } })
    if (!userInfo) return status(401, 'Registration is required')
    return { userInfo }
  })
