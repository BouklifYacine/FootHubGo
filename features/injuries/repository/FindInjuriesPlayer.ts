import { prisma } from "@/prisma";

export async function FindInjuriesPlayer(userId: string) {
  return await prisma.blessure.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      type: true,
      description: true,
      startDate: true,
      endDate: true,
      equipeId: true,
    },
  });
}
