"use serveur"

import { prisma } from "@/prisma";
import { PresenceRetour, ResultatAction, StatutPresence } from "../types/Presencetypes";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function modifierPresence(
  evenementId: string,
  statut: StatutPresence,
  userId?: string
): Promise<ResultatAction<PresenceRetour>> {
  try {
  const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Vous devez être connecté pour modifier vos présences",
        status: 401,
      };
    }

    const idUtilisateur = session.user.id;
    const utilisateurFinal = userId || idUtilisateur;

    const presenceExistante = await prisma.presence.findUnique({
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

    if (!presenceExistante) {
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
          equipeId: presenceExistante.evenement.equipeId,
        },
      });

      if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
        return {
          success: false,
          message: "Vous n'avez pas les droits pour modifier cette présence",
          status: 403,
        };
      }
    }

    const presenceMiseAJour = await prisma.presence.update({
      where: {
        userId_evenementId: {
          userId: utilisateurFinal,
          evenementId: evenementId,
        },
      },
      data: {
        statut: statut,
      },
    });

    revalidatePath(`/dashboardclient/mes-presences`);
    revalidatePath(`/dashboardclient/evenements/${presenceExistante.evenement.equipeId}`);

    return {
      success: true,
      message: "Présence mise à jour avec succès",
      data: presenceMiseAJour,
      status: 200,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de présence:", error);
    return {
      success: false,
      message: "Erreur serveur",
      erreur: error,
      status: 500,
    };
  }
} 