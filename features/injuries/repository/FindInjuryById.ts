import { prisma } from "@/prisma";

export async function FindInjuryById(injuryId: string, userId: string) {
  return await prisma.blessure.findFirst({
    where: {
      id: injuryId,
      userId,
    },
    select: {
      id: true,
      userId: true,
      equipeId: true,
      startDate: true,
      endDate: true,
      type: true,
      description: true,
    },
  });
}
