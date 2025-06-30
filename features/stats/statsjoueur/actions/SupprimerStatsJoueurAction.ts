"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function SupprimerStatsJoueurAction(
  id: string,
  joueurid: string,
  statistiqueid: string
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        message: "L'utilisateur n'est pas connecté",
      };
    }

    if (!id || !joueurid || !statistiqueid) {
      return {
        success: false,
        message: "Événement, joueur ou statistique inexistant ou incorrect",
      };
    }

    const MembreEquipe = await prisma.membreEquipe.findFirst({
      where: { userId },
      select: { role: true, equipeId: true },
    });

    const estEntraineur = MembreEquipe?.role === "ENTRAINEUR";

    if (!estEntraineur) {
      return {
        success: false,
        message: "Vous devez être entraîneur pour supprimer des stats de matchs",
      };
    }

    const evenement = await prisma.evenement.findUnique({
      where: { id },
      select: {
        typeEvenement: true,
        titre: true,
        equipeId: true,
        id: true,
      },
    });

    if (!evenement) {
      return {
        success: false,
        message: "Événement indisponible",
      };
    }

    const evenementEntrainement = evenement?.typeEvenement === "ENTRAINEMENT";

    if (evenementEntrainement) {
      return {
        success: false,
        message:
          "Vous ne pouvez pas supprimer les stats d'un événement d'entraînement",
      };
    }

    if (evenement.equipeId !== MembreEquipe.equipeId) {
      return {
        success: false,
        message: "Cet événement n'appartient pas à votre équipe",
      };
    }

    const StatsJoueur = await prisma.statistiqueJoueur.findFirst({
      where: { userId: joueurid, id: statistiqueid },
      select: { buts: true },
    });

    if (!StatsJoueur) {
      return {
        success: false,
        message: "Les stats de ce joueur n'existent pas",
      };
    }

    await prisma.statistiqueJoueur.delete({
      where: { id: statistiqueid },
    });

    return {
      success: true,
      message: `Les stats pour l'événement ${evenement.titre} ont été supprimées`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erreur serveur lors de la suppression des statistiques du joueur",
    };
  }
}