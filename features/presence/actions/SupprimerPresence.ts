"use serveur"

import { prisma } from "@/prisma";
import { ResultatAction } from "../types/Presencetypes";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function supprimerPresence(
  evenementId: string,
  userId?: string
): Promise<ResultatAction<void>> {
  try {

   const session = await auth.api.getSession({
       headers: await headers(),
     });
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Vous devez être connecté pour gérer vos présences",
        status: 401,
      };
    }

    const idUtilisateur = session.user.id;
    const utilisateurFinal = userId || idUtilisateur;
    
    const presence = await prisma.presence.findUnique({
      where: {
        userId_evenementId: {
          userId: utilisateurFinal,
          evenementId: evenementId,
        },
      },
      include: {
        evenement: {
          select: {
            equipeId: true,
          },
        },
      },
    });

    if (!presence) {
      return {
        success: false,
        message: "Présence non trouvée",
        status: 404,
      };
    }

    if (userId && userId !== idUtilisateur) {
      const membreEquipe = await prisma.membreEquipe.findFirst({
        where: {
          userId: idUtilisateur,
          equipeId: presence.evenement.equipeId,
        },
      });

      if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
        return {
          success: false,
          message: "Vous n'avez pas les droits pour supprimer cette présence",
          status: 403,
        };
      }
    }

    // Supprimer la présence
    await prisma.presence.delete({
      where: {
        userId_evenementId: {
          userId: utilisateurFinal,
          evenementId: evenementId,
        },
      },
    });

    revalidatePath(`/dashboardclient/mes-presences`);
    revalidatePath(`/dashboardclient/evenements/${presence.evenement.equipeId}`);

    return {
      success: true,
      message: "Présence supprimée avec succès",
      status: 200,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de présence:", error);
    return {
      success: false,
      message: "Erreur serveur",
      erreur: error,
      status: 500,
    };
  }
}