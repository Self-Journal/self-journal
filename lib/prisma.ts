import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Initialize database (run migrations on first start)
export async function initDatabase() {
  // Prisma handles schema creation via migrations
  // This is a no-op but kept for backward compatibility
  console.log('Database initialized with Prisma');
}

export default prisma;
