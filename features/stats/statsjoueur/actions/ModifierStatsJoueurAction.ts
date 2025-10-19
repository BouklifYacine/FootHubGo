"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import {
  ModifierStatsJoueurSchema,
  TypeModifierStatsJoueurSchema,
} from "../schema/ModifierStatsJoueurSchema";
import dayjs from "dayjs";

export async function modifierStatsJoueurAction(
  id: string,
  joueurid: string,
  statistiqueid: string,
  data: TypeModifierStatsJoueurSchema
) {
  try {
    if (!id || !joueurid || !statistiqueid)
      return {
        success: false,
        message: "Événement ou joueur inexistant ou incorrect",
      };

    const validation = ModifierStatsJoueurSchema.safeParse(data);

    if (!validation.success)
      return {
        success: false,
        message: validation.error.issues[0].message,
      };

    const { buts, minutesJouees, note, passesdecisive, poste, titulaire } =
      validation.data;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user.id;

    if (!userId)
      return {
        success: false,
        message: "L'utilisateur n'est pas connecté",
      };

    const MembreEquipe = await prisma.membreEquipe.findFirst({
      where: { userId },
      select: { role: true, equipeId: true },
    });

    const estEntraineur = MembreEquipe?.role === "ENTRAINEUR";

    if (!estEntraineur)
      return {
        success: false,
        message:
          "Vous devez être entraîneur pour modifier des stats pour un joueur",
      };

    const evenement = await prisma.evenement.findUnique({
      where: { id },
      select: {
        dateDebut: true,
        typeEvenement: true,
        titre: true,
        equipeId: true,
        presences: true,
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

    const debut = dayjs(evenement.dateDebut);
    if (dayjs().isAfter(debut.add(2, "days"))) {
      return {
        success: false,
        message: "Après 48h de la date de l'événement vous ne pouvez plus modifiez un évenement",
      };
    }

    const joueurPresent = evenement.presences.find(
      (i) => i.userId === joueurid
    );

    const MembreJoueur = await prisma.membreEquipe.findFirst({
      where: { userId: joueurid, equipeId: evenement.equipeId },
      select: { role: true, userId: true, user: { select: { name: true } } },
    });

    if (joueurPresent?.statut !== "PRESENT" || MembreJoueur?.role !== "JOUEUR")
      return {
        success: false,
        message:
          "Ce joueur n'est pas présent sur cet événement ou n'est pas un joueur",
      };

    const ancienneStat = await prisma.statistiqueJoueur.findUnique({
      where: {
        id: statistiqueid,
        userId: joueurid,
        evenementId: id,
      },
      select: {
        buts: true,
        passesdecisive: true,
      },
    });

    if (!ancienneStat)
      return {
        success: false,
        message: "Statistiques introuvables pour ce joueur",
      };

    const statsequipeexistante = await prisma.statistiqueEquipe.findUnique({
      where: { evenementId: id },
      select: { butsMarques: true },
    });

    if (!statsequipeexistante)
      return {
        success: false,
        message: "Vous devez d'abord enregistrer les stats de l'équipe",
      };

    const TeamStats = await prisma.statistiqueJoueur.aggregate({
      where: {
        evenementId: id,
        id: { not: statistiqueid },
      },
      _sum: {
        buts: true,
        passesdecisive: true,
      },
    });

    const nouveauTotalButs = (TeamStats._sum.buts || 0) + buts!;
    const nouveauTotalPasses =
      (TeamStats._sum.passesdecisive || 0) + passesdecisive!;

    if (nouveauTotalButs > statsequipeexistante.butsMarques) {
      return {
        success: false,
        message: `Le total des buts (${nouveauTotalButs}) dépasse les ${statsequipeexistante.butsMarques} buts de l'équipe`,
      };
    }

    if (nouveauTotalPasses > statsequipeexistante.butsMarques) {
      return {
        success: false,
        message: `Le total des passes décisives (${nouveauTotalPasses}) dépasse les ${statsequipeexistante.butsMarques} buts de l'équipe`,
      };
    }

    await prisma.statistiqueJoueur.update({
      where: {
        id: statistiqueid,
      },
      data: {
        buts,
        minutesJouees,
        note,
        passesdecisive,
        poste,
        titulaire,
      },
    });

    return {
      success: true,
      message: `Les stats pour le joueur ${MembreJoueur.user.name} ont été modifiées`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        "Erreur serveur lors de la modification des statistiques du joueur",
    };
  }
}
