/** Use prisma ORM  **/
import { PrismaClient } from '../../generated/prisma_client'
const connection = new PrismaClient()

export { connection }
