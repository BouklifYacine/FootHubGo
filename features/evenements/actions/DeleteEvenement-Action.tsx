"use server";

import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DeleteEvenementErrorResponse, DeleteEvenementResponse, DeleteEvenementSuccessResponse } from "../types/DeleteEvenementResponse";
import { headers } from "next/headers";


export async function deleteEvenement(
  equipeId: string,
  evenementId: string
): Promise<DeleteEvenementResponse> {
  try {
    // Validation de session
  const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user?.id) {
      const errorResponse: DeleteEvenementErrorResponse = {
        success: false,
        message: "Vous devez être connecté pour supprimer cet événement",
      };
      return errorResponse;
    }

    // Vérification que l'utilisateur est un entraîneur de l'équipe
    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        equipeId,
        userId: session.user.id,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEquipe) {
      const errorResponse: DeleteEvenementErrorResponse = {
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cet événement",
      };
      return errorResponse;
    }

    // Vérification que l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: {
        id: evenementId,
        equipeId,
      },
      select: { titre: true },
    });

    if (!evenement) {
      const errorResponse: DeleteEvenementErrorResponse = {
        success: false,
        message: "Événement non trouvé",
      };
      return errorResponse;
    }

    // Suppression de l'événement et des données associées dans une transaction
    await prisma.$transaction(async (tx) => {
      // Suppression des présences associées
      await tx.presence.deleteMany({
        where: { evenementId },
      });

      // Suppression des statistiques joueur associées
      await tx.statistiqueJoueur.deleteMany({
        where: { evenementId },
      });

      // Suppression des statistiques équipe associées
      await tx.statistiqueEquipe.deleteMany({
        where: { evenementId },
      });

      // Suppression de l'événement
      await tx.evenement.delete({
        where: { id: evenementId },
      });
    });

    // Invalider le cache pour mettre à jour les listes d'événements
    revalidatePath(`/dashboardclient/equipe/${equipeId}/evenements`);
    revalidatePath(`/dashboardclient/evenements/${equipeId}`);

    const successResponse: DeleteEvenementSuccessResponse = {
      success: true,
      message: `L'événement "${evenement.titre}" a été supprimé avec succès`,
    };

    return successResponse;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    const errorResponse: DeleteEvenementErrorResponse = {
      success: false,
      message: "Erreur lors de la suppression de l'événement",
    };
    return errorResponse;
  }
} 