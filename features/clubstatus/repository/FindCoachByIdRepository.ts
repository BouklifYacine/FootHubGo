import type { PrismaClient } from "@prisma/client";

export async function FindCoachById(
  teamId: string,
  userId : string,
  prisma: PrismaClient
) {
  return await prisma.membreEquipe.findFirst({
    where: {
      equipeId: teamId,
      userId,
    },
    select: { role: true },
  });
}


