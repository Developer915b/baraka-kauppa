import { PrismaClient } from "@prisma/client";

// Lazy, guarded Prisma singleton. Returns null when no DATABASE_URL is
// configured (e.g. on Netlify, where SQLite files are not part of the
// deployment) so API routes can fall back to the static catalog gracefully.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getDb(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  try {
    const client = new PrismaClient({
      log: ["error"],
    });
    globalForPrisma.prisma = client;
    return client;
  } catch (error) {
    console.error("Prisma client init failed:", error);
    return null;
  }
}
