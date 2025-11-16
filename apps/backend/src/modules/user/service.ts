import { connection } from '../../collection/db.ts'

export abstract class UserService {
  static async getUsers() {
    return connection.user.findMany()
  }
}
