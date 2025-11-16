import { connection } from '../../collection/db.ts'

export abstract class User {
  static async getUsers() {
    return connection.user.findMany()
  }
}
