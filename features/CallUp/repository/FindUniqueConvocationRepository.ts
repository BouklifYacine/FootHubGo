import { prisma } from "@/prisma";
import type { PrismaClient } from "@prisma/client";

export async function FindConvocationById(
  convocationId: string,
  client: PrismaClient = prisma
) {
  return await client.convocation.findUnique({
    where: { id: convocationId },
    select: {
      id: true,
      userId: true,
      statut: true,
      evenementId: true,
      dateReponse: true,
    },
  });
}
