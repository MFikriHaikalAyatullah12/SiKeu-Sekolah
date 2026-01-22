import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with connection pool settings for serverless
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Always keep connection in global to prevent connection pool exhaustion
globalForPrisma.prisma = prisma

// Handle connection errors gracefully
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})