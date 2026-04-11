import path from 'node:path';
import { PrismaClient } from '@/generated/prisma/client';

// SQLite + Next.js relative-path gotcha: Prisma's CLI resolves file: URLs
// relative to schema.prisma, but the app runtime resolves them from CWD.
// Always pass an absolute path to the client so both agree.
const dbAbsolutePath = path.resolve(process.cwd(), 'prisma', 'portfolio.db');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: `file:${dbAbsolutePath}`,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
