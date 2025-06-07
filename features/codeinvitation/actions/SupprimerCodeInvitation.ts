"use server"

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function supprimerCodeInvitation(equipeId: string) {
  try {
 const session = await auth.api.getSession({
    headers: await headers() 
})
    const idUtilisateur = session?.user?.id;

    if (!idUtilisateur) {
      return {
        success: false,
        message: "Vous devez être connecté"
      };
    }

    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
    });

    if (!equipe) {
      return {
        success: false,
        message: "Équipe non trouvée"
      };
    }

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: equipeId,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEquipe) {
      return {
        success: false,
        message: "Seuls les coachs peuvent supprimer le code d'invitation"
      };
    }

    if (!equipe.codeInvitation) {
      return {
        success: false,
        message: `Aucun code d'invitation existant pour l'équipe ${equipe.nom}`
      };
    }

    await prisma.equipe.update({
      where: { id: equipeId },
      data: { codeInvitation: null },
    });

    revalidatePath(`/dashboardclient/equipe/${equipeId}`);

    return {
      success: true,
      message: `Code d'invitation de l'équipe ${equipe.nom} supprimé`
    };

  } catch (error) {
    console.error("Erreur lors de la suppression du code d'invitation:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression du code d'invitation"
    };
  }
}