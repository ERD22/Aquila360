import { PrismaClient } from '@prisma/client';
import { DATABASE_URL } from '$env/static/private';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;