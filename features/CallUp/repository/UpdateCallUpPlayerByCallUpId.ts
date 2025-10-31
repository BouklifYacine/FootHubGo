import { prisma } from "@/prisma";
import { PrismaClient } from "@prisma/client";

export async function UpdateCallUpPlayerByCallUpId ( 
  convocationId: string,
  prismatx: PrismaClient = prisma,
  statutData : "CONFIRME" | "REFUSE"){
    return await prismatx.convocation.update({ where: { id: convocationId, statut: "EN_ATTENTE" },
        data: {
          statut: statutData,
          dateReponse: new Date(),
        },
        select: {
          id: true,
          statut: true,
          dateReponse: true,
        },

    })
}