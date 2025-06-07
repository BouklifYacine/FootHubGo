// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Fonction pour obtenir l'URL de la base de données selon l'environnement
const getDatabaseUrl = (): string => {
  // Utilise toujours DATABASE_URL qui est défini dans les fichiers .env appropriés
  return process.env.DATABASE_URL!;
};

// Définir la variable DATABASE_URL dynamiquement pour Prisma
const dbUrl = getDatabaseUrl();

// évite de multiple instanciations en dev
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Log simplifié
console.log(`🔗 Base de données: ${dbUrl.includes('summer-king') ? 'DEV (summer-king)' : 'PROD (lingering-darkness)'}`);
