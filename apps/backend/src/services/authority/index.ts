import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'

import { connection } from '../../collection/mysql'
import { redis } from '../../collection/redis'
import { sendEmail } from '../../utils/nodemailer'
import { AuthorityModel } from './model'
import { generateVerificationCode } from './utils'

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
          const { email } = body
          const verificationCode = generateVerificationCode()
          redis.set(email, verificationCode, 'EX', 60)
          await sendEmail('test', 'The login verification code for this time is ' + verificationCode, email)
          return 'The verification code was successfully obtained, please check it in your mailbox.' as const
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
        async ({ jwt, body, error }) => {
          const { email, verificationCode } = body
          const preVerificationCode = await redis.get(email)
          if (!preVerificationCode) {
            return error(400, 'Please get a verification code first.')
          }
          if (verificationCode === preVerificationCode) {
            const userInfo = await connection.user.upsert({
              where: { email },
              update: { email },
              create: { email },
            })
            return await jwt.sign({ email: userInfo.email, userId: userInfo.id })
          } else {
            return error(
              400,
              'The verification code is incorrect, please check your email verification code, or get it again after 60s.',
            )
          }
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
