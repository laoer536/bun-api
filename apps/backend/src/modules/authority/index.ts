import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'
import { AuthorityModel } from './model'
import { Authority } from './service.ts'

export const authorityService = new Elysia({ tags: ['Authority'] })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRETS!,
    }),
  )
  .group('/authority', (app) =>
    app
      .post(
        '/get_verification_code',
        async ({ body }) => {
          return Authority.getVerificationCode(body)
        },
        {
          body: AuthorityModel.getVerificationCodeBody,
          response: {
            200: AuthorityModel.getVerificationCodeResponse,
          },
        },
      )
      .post(
        '/login',
        async ({ jwt, body }) => {
          const userInfo = await Authority.login(body)
          return jwt.sign({ email: userInfo.email, userId: userInfo.id })
        },
        {
          body: AuthorityModel.loginBody,
          response: {
            200: AuthorityModel.loginResponse,
            400: AuthorityModel.loginResponse400,
          },
        },
      ),
  )
