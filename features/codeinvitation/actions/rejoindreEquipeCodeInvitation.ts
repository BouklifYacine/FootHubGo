"use server"

import { auth } from "@/auth";
import { RejoindreEquipeSchema } from "@/features/equipe/schemas/SchemaEquipe";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CodeInvitationType, RejoindreEquipeInput } from "../types/codeinvitationtypes";

export async function rejoindreEquipeCodeInvitation(
  data: RejoindreEquipeInput
): Promise<CodeInvitationType> {
  const validationResult = RejoindreEquipeSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Données invalides",
    };
  }

  const { codeInvitation } = validationResult.data;

 const session = await auth.api.getSession({
    headers: await headers() 
});
  const idUtilisateur = session?.user?.id;

  if (!idUtilisateur) {
    return {
      success: false,
      message: "Utilisateur non authentifié",
    };
  }

  try {
    const utilisateur = await prisma.user.findUnique({
      where: { id: idUtilisateur },
    });

    if (!utilisateur) {
      return {
        success: false,
        message: "Utilisateur introuvable",
      };
    }

    const equipe = await prisma.equipe.findFirst({
      where: { codeInvitation },
    });

    if (!equipe) {
      return {
        success: false,
        message: "Code d'invitation invalide ou équipe non trouvée",
      };
    }

    const membreExistant = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: equipe.id,
      },
    });

    if (membreExistant) {
      return {
        success: false,
        message: "Vous êtes déjà membre de cette équipe",
        equipeId: equipe.id, 
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.membreEquipe.create({
        data: {
          equipeId: equipe.id,
          userId: idUtilisateur,
          role: "JOUEUR",
        },
      });

      await tx.user.update({
        where: { id: idUtilisateur },
        data: {
          roleEquipe: "JOUEUR",
          AunClub: "OUI",
        },
      });
    });

    revalidatePath("/equipes");
    revalidatePath("/dashboardclient");

    return {
      success: true,
      message: `Vous avez rejoint l'équipe ${equipe.nom} avec succès.`,
      equipeId: equipe.id, 
    };
  } catch (error) {
    console.error("Erreur lors de la rejoindre l'équipe:", error);
    return {
      success: false,
      message: "Erreur lors de l'opération de rejoindre l'équipe",
    };
  }
}