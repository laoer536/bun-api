import { jwt } from '@elysiajs/jwt'
import { Elysia, t } from 'elysia'

import { connection } from '../../collection/mysql'
import { redis } from '../../collection/redis'
import { sendEmail } from '../../utils/nodemailer'
import { generateVerificationCode } from './utils'

export const authorityService = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRETS!,
    }),
  )
  .post(
    '/authority/get_verification_code',
    async ({ body }) => {
      const { email } = body
      const verificationCode = generateVerificationCode()
      redis.set(email, verificationCode, 'EX', 60)
      await sendEmail('test', 'The login verification code for this time is ' + verificationCode, email)
      return 'The verification code was successfully obtained, please check it in your mailbox.'
    },
    {
      body: t.Object({ email: t.String() }),
    },
  )
  .post(
    '/authority/login',
    async ({ jwt, body, error }) => {
      const { email, verificationCode } = body
      const preVerificationCode = await redis.get(email)
      if (!preVerificationCode) {
        return error(400, 'Please get a verification code first.')
      }
      if (verificationCode === preVerificationCode) {
        await connection.user.upsert({
          where: { email },
          update: { email },
          create: { email, name: `user${verificationCode}` },
        })
        return await jwt.sign({ email })
      } else {
        return error(
          400,
          'The verification code is incorrect, please check your email verification code, or get it again after 60s.',
        )
      }
    },
    {
      body: t.Object({ verificationCode: t.String(), email: t.String() }),
    },
  )
