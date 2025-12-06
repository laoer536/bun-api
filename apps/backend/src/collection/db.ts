/** Use prisma ORM  **/
import { PrismaClient } from '../../generated/prisma_client'
const prisma = new PrismaClient()

export { prisma }
