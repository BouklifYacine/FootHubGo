import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Évite de multiples instanciations en dev (hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  // `next build` imports the routes without querying: the Docker image is built without secrets.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (!connectionString && !isBuild) throw new Error("DATABASE_URL n'est pas défini");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
