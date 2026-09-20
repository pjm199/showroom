import { PrismaClient } from './prisma-v2-client'

const globalForPrismaV2 = globalThis as unknown as { prismaV2?: PrismaClient }

export const prismaV2 =
  globalForPrismaV2.prismaV2 ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrismaV2.prismaV2 = prismaV2
}
