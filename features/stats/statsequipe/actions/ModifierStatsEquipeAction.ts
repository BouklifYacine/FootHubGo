"use server";

import { auth } from "@/auth";
import {
  ModifierStatsEquipeSchema,
  SchemaModificationStatsEquipe,
} from "@/features/stats/statsequipe/schema/ModifierStatsEquipeSchema";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function ModifierStatsEquipeAction(
  data: SchemaModificationStatsEquipe,
  idevenement: string,
  statsequipeid: string
) {
  try {
    if (!idevenement || !statsequipeid)
      return {
        success: false,
        message: "Événement inexistant ou incorrect",
      };

    const validation = ModifierStatsEquipeSchema.safeParse(data);

    if (!validation.success)
      return {
        success: false,
        message: validation.error.issues[0].message,
      };

    const {
      butsEncaisses,
      cleanSheet,
      butsMarques,
      competition,
      domicile,
      resultatMatch,
      tirsCadres,
      tirsTotal,
    } = validation.data;

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
        message: "Vous devez être entraîneur pour modifier des stats de matchs",
      };

    const evenement = await prisma.evenement.findUnique({
      where: { id : idevenement },
      select: {
        dateDebut: true,
        typeEvenement: true,
        titre: true,
        adversaire: true,
        equipeId: true,
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
          "Vous ne pouvez pas modifier des stats pour des événements d'entraînement",
      };

    if (evenement.equipeId !== MembreEquipe.equipeId) {
      return {
        success: false,
        message: "Cet événement n'appartient pas à votre équipe",
      };
    }

    const StatsEquipe = await prisma.statistiqueEquipe.findUnique({
      where: {
        id: statsequipeid,
        evenementId: idevenement,
      },
    });

    if (!StatsEquipe)
      return {
        success: false,
        message: "Aucune statistique d'équipe disponible",
      };

    await prisma.statistiqueEquipe.update({
      where: {
        id: statsequipeid,
      },
      data: {
        adversaire: evenement.adversaire || "",
        butsEncaisses,
        cleanSheet,
        butsMarques,
        competition,
        domicile,
        resultatMatch,
        tirsCadres,
        tirsTotal,
        equipeId: MembreEquipe.equipeId,
        evenementId: idevenement,
      },
    });

    return {
      success: true,
      message: `Les stats pour l'événement ${evenement.titre} ont été modifiées`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erreur serveur lors de la modification des statistiques",
    };
  }
}
