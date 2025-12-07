import type { PrismaClient } from "@prisma/client";


export async function CheckRequestsLimit(userId: string, prisma: PrismaClient) {
  const activeRequests = await prisma.demandeAdhesion.count({
    where: {
      userId: userId,
      statut: "ATTENTE" 
    }
  });

  return activeRequests;
}

export async function FindPlayerById(userId: string, prisma: PrismaClient) {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      MembreEquipe: {
        select: { role: true },
      },
    },
  });
}
