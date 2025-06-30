"use server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function SupprimerStatsEquipeAction( id: string,statsequipeid: string) {
  try {
    if (!id || !statsequipeid)
      return {
        success: false,
        message: "Stats inexistantes ou incorrectes",
      };

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user.id;

    const MembreEquipe = await prisma.membreEquipe.findFirst({
      where: { userId },
      select: { role: true, equipeId: true },
    });

    const estEntraineur = MembreEquipe?.role === "ENTRAINEUR";

    if (!estEntraineur)
      return {
        success: false,
        message: "Vous devez être entraîneur pour supprimer des stats de matchs",
      };

    const evenement = await prisma.evenement.findUnique({
      where: { id },
      select: {
        typeEvenement: true,
        titre: true,
        equipeId: true,
        id: true,
      },
    });

    if (!evenement)
      return {
        success: false,
        message: "Événement indisponible",
      };

    const evenementEntrainement = evenement?.typeEvenement === "ENTRAINEMENT";

    if (evenementEntrainement)
      return {
        success: false,
        message:
          "Vous ne pouvez pas supprimer les stats d'un événement d'entraînement",
      };

    if (evenement.equipeId !== MembreEquipe.equipeId) {
      return {
        success: false,
        message: "Cet événement n'appartient pas à votre équipe",
      };
    }

    const StatsEquipe = await prisma.statistiqueEquipe.findUnique({
      where: { id: statsequipeid },
    });

    if (!StatsEquipe)
      return {
        success: false,
        message: "Les stats du match n'existent pas",
      };

    await prisma.$transaction(async (tx) => {
      await tx.statistiqueEquipe.delete({
        where: { id: statsequipeid, equipeId: MembreEquipe.equipeId },
      });
      await tx.statistiqueJoueur.deleteMany({
        where: { evenementId: StatsEquipe.evenementId! },
      });
    });

    return {
      success: true,
      message: `Les stats pour l'événement ${evenement.titre} ont été supprimées`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erreur serveur lors de la suppression des statistiques",
    };
  }
}