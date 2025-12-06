// The service handles the business logic and is decoupled from the Elysia controller
import type { AuthorityModelType } from './model'
import { generateVerificationCode } from './utils.ts'
import { redis } from '../../collection/redis.ts'
import { sendEmail } from '../../utils/nodemailer.ts'
import { prisma } from '../../collection/db.ts'
import { status } from 'elysia'

// If the class does not need to store properties, you can use 'abstract class' to avoid class instance allocation
export abstract class AuthorityService {
  static async getVerificationCode({ email }: AuthorityModelType['getVerificationCodeBody']) {
    const verificationCode = generateVerificationCode()
    redis.set(email, verificationCode, 'EX', 60)
    await sendEmail('test', 'The login verification code for this time is ' + verificationCode, email)
    return 'The verification code was successfully obtained, please check it in your mailbox.' as const
  }

  static async login({ email, verificationCode }: AuthorityModelType['loginBody']) {
    const preVerificationCode = await redis.get(email)
    if (!preVerificationCode) {
      throw status(400, 'Please get a verification code first.')
    }
    if (verificationCode === preVerificationCode) {
      const userInfo = await prisma.user.upsert({
        where: { email },
        update: { email },
        create: { email },
      })
      return userInfo
    } else {
      throw status(
        400,
        'The verification code is incorrect, please check your email verification code, or get it again after 60s.',
      )
    }
  }
}
