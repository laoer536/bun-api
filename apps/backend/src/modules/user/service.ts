import { prisma } from '../../collection/db.ts'

export abstract class UserService {
  static async getUsers() {
    return prisma.user.findMany()
  }
}
