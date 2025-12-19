import { prisma } from '@/lib/prisma'

export abstract class UserService {
  static async getUsers() {
    return prisma.user.findMany()
  }
}
