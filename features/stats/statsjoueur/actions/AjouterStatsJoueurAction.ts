'use server';

import { auth } from "@/auth";
import {
  AjouterStatsJoueurSchema,
  schemaAjouterStatsJoueurSchema,
} from "@/features/stats/statsjoueur/schema/AjouterStatsJoueurSchema";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { headers } from "next/headers";

export async function AjouterStatsJoueurAction(
  data: schemaAjouterStatsJoueurSchema,
  id: string,
  joueurid: string
) {
  try {
    if (!id || !joueurid) {
      return {
        success: false,
        message: "Événement ou joueur inexistant ou incorrect",
      };
    }
    const validation = AjouterStatsJoueurSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0].message,
      };
    }
    const { buts, minutesJouees, note, passesdecisive, poste, titulaire } =
      validation.data;

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user.id;
    if (!userId) {
      return {
        success: false,
        message: "L'utilisateur n'est pas connecté",
      };
    }
    const membre = await prisma.membreEquipe.findFirst({
      where: { userId },
      select: { role: true, equipeId: true },
    });
    if (membre?.role !== "ENTRAINEUR") {
      return {
        success: false,
        message:
          "Vous devez être entraîneur pour ajouter des stats pour un joueur",
      };
    }

    const evenement = await prisma.evenement.findUnique({
      where: { id },
      select: {
        dateDebut: true,
        typeEvenement: true,
        equipeId: true,
        presences: true,
      },
    });
    if (!evenement) {
      return { success: false, message: "Événement indisponible" };
    }
    if (evenement.typeEvenement === "ENTRAINEMENT") {
      return {
        success: false,
        message:
          "Vous ne pouvez pas ajouter de stats pour des événements d'entraînement",
      };
    }
    if (evenement.equipeId !== membre.equipeId) {
      return {
        success: false,
        message: "Cet événement n'appartient pas à votre équipe",
      };
    }

    const presence = evenement.presences.find((p) => p.userId === joueurid);
    const membreJoueur = await prisma.membreEquipe.findFirst({
      where: { userId: joueurid, equipeId: evenement.equipeId },
      select: { role: true, user: { select: { name: true } } },
    });
    if (presence?.statut !== "PRESENT" || membreJoueur?.role !== "JOUEUR") {
      return {
        success: false,
        message:
          "Ce joueur n'est pas présent à cet événement ou n'est pas un joueur",
      };
    }

    const debut = dayjs(evenement.dateDebut);
    if (dayjs().isBefore(debut.add(3, "hour"))) {
      return {
        success: false,
        message:
          "Vous devez attendre 3 heures après le début de l'événement pour inscrire les statistiques",
      };
    }

    const deja = await prisma.statistiqueJoueur.findFirst({
      where: { evenementId: id, userId: joueurid },
    });
    if (deja) {
      return {
        success: false,
        message: "Des stats existent déjà pour ce joueur",
      };
    }

    const statsequipe = await prisma.statistiqueEquipe.findUnique({
      where: { evenementId: id },
      select: { butsMarques: true },
    });
    if (!statsequipe) {
      return {
        success: false,
        message: "Vous devez inscrire les stats de l'équipe en premier",
      };
    }
    const teamButs = statsequipe.butsMarques;

    const ag = await prisma.statistiqueJoueur.aggregate({
      where: { evenementId: id },
      _sum: { buts: true, passesdecisive: true },
    });
    const totalButsExistants = ag._sum.buts ?? 0;
    const totalPassesExistantes = ag._sum.passesdecisive ?? 0;

    if (buts > teamButs) {
      return {
        success: false,
        message: "Un joueur ne peut pas inscrire plus de buts que l’équipe !",
      };
    }
    if (passesdecisive > teamButs) {
      return {
        success: false,
        message:
          "Un joueur ne peut pas avoir plus de passes décisives " +
          "que de buts marqués par l’équipe !",
      };
    }

    if (totalButsExistants + buts > teamButs) {
      return {
        success: false,
        message:
          "La somme des buts de tous les joueurs dépasserait le total " +
          "inscrit par l’équipe.",
      };
    }
    if (totalPassesExistantes + passesdecisive > teamButs) {
      return {
        success: false,
        message:
          "La somme des passes décisives de tous les joueurs dépasserait " +
          "le nombre de buts marqués par l’équipe.",
      };
    }

    await prisma.statistiqueJoueur.create({
      data: {
        userId: joueurid,
        evenementId: id,
        poste,
        buts,
        passesdecisive,
        minutesJouees,
        note,
        titulaire,
      },
    });

    return {
      success: true,
      message: `Les stats pour le joueur ${membreJoueur.user.name} ont été ajoutées`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erreur serveur lors de l'ajout des statistiques du joueur",
    };
  }
}