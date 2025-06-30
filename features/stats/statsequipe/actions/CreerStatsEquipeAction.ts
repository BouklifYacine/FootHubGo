"use server";

import { auth } from "@/auth";
import {
  AjouterStatsEquipeSchema,
  SchemaAjouterStatsEquipe,
} from "@/features/stats/statsequipe/schema/AjouterStatsEquipeSchema";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { headers } from "next/headers";

export async function CreerStatsEquipeAction(data: SchemaAjouterStatsEquipe,idEvenement: string) {
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

  const validation = AjouterStatsEquipeSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0].message,
    };
  }

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

  const membre = await prisma.membreEquipe.findFirst({
    where: { userId },
    select: { role: true, equipeId: true },
  });
  if (membre?.role !== "ENTRAINEUR") {
    return {
      success: false,
      message: "Vous devez être entraîneur pour ajouter des stats de matchs",
    };
  }

  const evenement = await prisma.evenement.findUnique({
    where: { id: idEvenement },
    select: {
      dateDebut: true,
      typeEvenement: true,
      titre: true,
      adversaire: true,
      equipeId: true,
    },
  });
  if (!evenement) {
    return {
      success: false,
      message: "Événement indisponible",
    };
  }

  if (evenement.typeEvenement === "ENTRAINEMENT") {
    return {
      success: false,
      message:
        "Vous ne pouvez pas donner de stats à des événements " +
        "d'entraînement",
    };
  }

  if (evenement.equipeId !== membre.equipeId) {
    return {
      success: false,
      message: "Cet événement n'appartient pas à votre équipe",
    };
  }

  const debut = dayjs(evenement.dateDebut);
  const limite = debut.add(3, "hour");
  if (dayjs().isBefore(limite)) {
    return {
      success: false,
      message:
        "Vous devez attendre 3 heures après le début de l'événement " +
        "pour inscrire les statistiques",
    };
  }

  const deja = await prisma.statistiqueEquipe.findUnique({
    where: { evenementId: idEvenement },
    select: { resultatMatch: true },
  });
  if (deja?.resultatMatch) {
    return {
      success: false,
      message: "Des stats existent déjà pour ce match",
    };
  }

  await prisma.statistiqueEquipe.create({
    data: {
      adversaire: evenement.adversaire ?? "",
      butsEncaisses,
      cleanSheet,
      butsMarques,
      competition,
      domicile,
      resultatMatch,
      tirsCadres,
      tirsTotal,
      equipeId: membre.equipeId,
      evenementId: idEvenement,
    },
  });

  return {
    success: true,
    message: `Les stats pour l'événement "${evenement.titre}" ont été ajoutées`,
  };
}
