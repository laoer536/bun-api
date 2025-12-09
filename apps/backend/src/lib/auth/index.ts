import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from '../../../generated/prisma_client'
const prisma = new PrismaClient()
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.FRONTEND_URL as string],
  database: prismaAdapter(prisma, {
    provider: 'postgresql', // or "mysql", "postgresql", ...etc
  }),
})

export const betterAuthView = (request: Request) => {
  const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET']
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(request.method)) {
    return auth.handler(request)
  } else {
    return Response.json(
      {
        message: 'Method Not Allowed',
      },
      {
        status: 405,
      },
    )
  }
}
