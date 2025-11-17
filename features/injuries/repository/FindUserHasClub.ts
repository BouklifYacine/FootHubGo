import { prisma } from "@/prisma";

export async function FindUserIsPlayer(userId: string) {
  return await prisma.membreEquipe.findFirst({
    where: { userId, role: "JOUEUR" },
    select: { equipeId: true },
  });
}

