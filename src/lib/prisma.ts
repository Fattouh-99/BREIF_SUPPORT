import { PrismaClient, Prisma } from '@prisma/client'

// Define extended client type that includes our models
interface ExtendedPrismaClient extends PrismaClient {
  customerFeedback: any;
  newsletterSubscriber: any;
}

// Make sure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined, setting fallback for build process');
  // Set a placeholder URL for build processes that doesn't expose credentials
  process.env.DATABASE_URL = 'postgresql://placeholder_user:placeholder_password@placeholder_host/placeholder_db?sslmode=require';
}

const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient }

// Initialize with logging in dev mode to debug connection issues
const prismaOptions: Prisma.PrismaClientOptions = process.env.NODE_ENV !== 'production'
  ? { log: [
      { level: 'query', emit: 'event' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
      { level: 'error', emit: 'stdout' },
    ]}
  : {};

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaOptions) as ExtendedPrismaClient
export const client = prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
