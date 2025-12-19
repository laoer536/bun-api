import { prisma } from '@/lib/prisma.ts'

export abstract class UserService {
  static async getUsers() {
    return prisma.user.findMany()
  }
}
