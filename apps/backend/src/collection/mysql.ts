/** Use prisma ORM  **/
import { PrismaClient } from '@prisma/client'
const connection = new PrismaClient()

export { connection }
