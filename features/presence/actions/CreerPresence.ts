"use server";

import { prisma } from "@/prisma";
import { PresenceSchema } from "../schemas/SchemaPresence";
import {
  PresenceRetour,
  ResultatAction,
  StatutPresence,
} from "../types/Presencetypes";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function creerPresence(
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
        message: "Vous devez être connecté pour gérer vos présences",
        status: 401,
      };
    }

    const idUtilisateur = session.user.id;

    const validationResult = PresenceSchema.safeParse({
      statut,
      userId: userId || undefined,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: "Données invalides",
        erreur: validationResult.error.format(),
        status: 400,
      };
    }

    const data = validationResult.data;

    const evenement = await prisma.evenement.findUnique({
      where: { id: evenementId },
      include: { equipe: true },
    });

    if (!evenement) {
      return {
        success: false,
        message: "Événement non trouvé",
        status: 404,
      };
    }

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: evenement.equipeId,
      },
    });

    if (!membreEquipe) {
      return {
        success: false,
        message: "Vous n'êtes pas membre de cette équipe",
        status: 403,
      };
    }

    let utilisateurFinal = idUtilisateur;

    if (data.userId && data.userId !== idUtilisateur) {
      if (membreEquipe.role !== "ENTRAINEUR") {
        return {
          success: false,
          message: "Vous ne pouvez indiquer que votre propre présence",
          status: 403,
        };
      }

      const membreCible = await prisma.membreEquipe.findFirst({
        where: {
          userId: data.userId,
          equipeId: evenement.equipeId,
        },
      });

      if (!membreCible) {
        return {
          success: false,
          message: "L'utilisateur cible n'est pas membre de cette équipe",
          status: 404,
        };
      }

      utilisateurFinal = data.userId;
    }

    const presenceExistante = await prisma.presence.findUnique({
      where: {
        userId_evenementId: {
          userId: utilisateurFinal,
          evenementId: evenementId,
        },
      },
    });

    if (presenceExistante) {
      const presenceMiseAJour = await prisma.presence.update({
        where: {
          userId_evenementId: {
            userId: utilisateurFinal,
            evenementId: evenementId,
          },
        },
        data: {
          statut: data.statut,
        },
      });

      revalidatePath(`/dashboardclient/mes-presences`);
      revalidatePath(`/dashboardclient/evenements/${evenement.equipeId}`);

      return {
        success: true,
        message: "Présence mise à jour avec succès",
        data: presenceMiseAJour,
        status: 200,
      };
    }

    const nouvellePresence = await prisma.presence.create({
      data: {
        userId: utilisateurFinal,
        evenementId: evenementId,
        statut: data.statut,
      },
    });

    revalidatePath(`/dashboardclient/mes-presences`);
    revalidatePath(`/dashboardclient/evenements/${evenement.equipeId}`);

    return {
      success: true,
      message: "Présence créée avec succès",
      data: nouvellePresence,
      status: 201,
    };
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour de présence:", error);
    return {
      success: false,
      message: "Erreur serveur",
      erreur: error,
      status: 500,
    };
  }
}
