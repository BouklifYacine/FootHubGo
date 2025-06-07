"use server";

import { prisma } from "@/prisma";
import { SessionAdmin } from "../../../lib/SessionAdmin";
import { Prisma } from "@prisma/client";

interface DeleteResponse {
  success: boolean;
}

export async function deleteUsers(ids: string[]): Promise<DeleteResponse> {
  try {
    await SessionAdmin();

    await prisma.$transaction(async (tx :  Prisma.TransactionClient) => {
      await tx.session.deleteMany({
        where: { userId: { in: ids } },
      });

      await tx.account.deleteMany({
        where: { userId: { in: ids } },
      });

      await tx.abonnement.deleteMany({
        where: { userId: { in: ids } },
      });

      await tx.user.deleteMany({
        where: { id: { in: ids } },
      });
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    return {
      success: false,
    };
  }
}
