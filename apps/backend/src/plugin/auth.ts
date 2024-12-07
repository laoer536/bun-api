import { bearer } from '@elysiajs/bearer'
import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'

import { connection } from '../collection/mysql'

interface AuthOptions {
  exclude: string[]
}

export const auth = ({ exclude }: AuthOptions) =>
  new Elysia({ name: 'auth' })
    .use(bearer())
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRETS!,
      }),
    )
    .onBeforeHandle({ as: 'global' }, async (ctx) => {
      let isNeedLogin = true
      for (const excludePath of exclude) {
        if (ctx.path.includes(excludePath)) {
          isNeedLogin = false
          break
        }
      }
      if (isNeedLogin) {
        const profile = await ctx.jwt.verify(ctx.bearer)
        if (!profile) {
          return ctx.error(401)
        }
      }
    })
    .derive({ as: 'global' }, async ({ bearer, jwt }) => {
      const tokenPayload = (await jwt.verify(bearer)) as { email: string | undefined }
      const email = tokenPayload.email
      if (email) {
        const userInfo = await connection.user.findUnique({ where: { email } })
        return { userInfo }
      } else {
        return {}
      }
    })
