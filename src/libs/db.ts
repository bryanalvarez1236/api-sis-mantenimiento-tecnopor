import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

const { NODE_ENV, DATABASE_URL, DATABASE_URL_TEST } = process.env

if (NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      datasources: {
        db: { url: NODE_ENV === 'test' ? DATABASE_URL_TEST : DATABASE_URL },
      },
    })
  }
  prisma = globalWithPrisma.prisma
}

export default prisma
