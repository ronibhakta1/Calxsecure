import { PrismaClient } from '../generated'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma: ReturnType<typeof prismaClientSingleton> = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma
export { PrismaClient }

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma