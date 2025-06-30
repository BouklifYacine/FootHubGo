"use server";

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
    if (!id || !joueurid)
      return {
        success: false,
        message: "Événement ou joueur inexistant ou incorrect",
      };

    const validation = AjouterStatsJoueurSchema.safeParse(data);

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

    if (!userId) {
      return {
        success: false,
        message: "L'utilisateur n'est pas connecté",
      };
    }

    const MembreEquipe = await prisma.membreEquipe.findFirst({
      where: { userId },
      select: { role: true, equipeId: true },
    });

    const estEntraineur = MembreEquipe?.role === "ENTRAINEUR";

    if (!estEntraineur)
      return {
        success: false,
        message:
          "Vous devez être entraîneur pour ajouter des stats pour un joueur",
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
          "Vous ne pouvez pas ajouter de stats pour des événements d'entraînement",
      };

    if (evenement.equipeId !== MembreEquipe.equipeId) {
      return {
        success: false,
        message: "Cet événement n'appartient pas à votre équipe",
      };
    }

    const joueurPresent = evenement.presences.find((i) => i.userId === joueurid);

    const MembreJoueur = await prisma.membreEquipe.findFirst({
      where: { userId: joueurid, equipeId: evenement.equipeId },
      select: { role: true, userId: true, user: { select: { name: true } } },
    });

    if (joueurPresent?.statut !== "PRESENT" || MembreJoueur?.role !== "JOUEUR")
      return {
        success: false,
        message:
          "Ce joueur n'est pas présent à cet événement ou n'est pas un joueur",
      };

    const debut = dayjs(evenement?.dateDebut);
    const limiteTempsEvenement = debut.add(3, "hour");
    const maintenant = dayjs();

    if (maintenant.isBefore(limiteTempsEvenement))
      return {
        success: false,
        message:
          "Vous devez attendre 3 heures après le début de l'événement pour inscrire les statistiques",
      };

    const statsjoueur = await prisma.statistiqueJoueur.findFirst({
      where: { evenementId: id, userId: joueurid },
    });

    if (statsjoueur)
      return {
        success: false,
        message: "Des stats existent déjà pour ce joueur",
      };

    const statsequipeexistante = await prisma.statistiqueEquipe.findUnique({
      where: { evenementId: id },
      select: { butsMarques: true },
    });

    if (!statsequipeexistante)
      return {
        success: false,
        message: "Vous devez inscrire les stats de l'équipe en premier",
      };

    const TeamStats = await prisma.statistiqueJoueur.aggregate({
      where: { evenementId: id },
      _sum: { buts: true, passesdecisive: true },
    });

    const totalbuts = TeamStats._sum.buts ?? 0;
    const totalpassedecisive = TeamStats._sum.passesdecisive ?? 0;

    if (
      totalbuts > statsequipeexistante.butsMarques ||
      totalpassedecisive > statsequipeexistante.butsMarques
    )
      return {
        success: false,
        message:
          "Vos joueurs ont inscrit plus de buts ou passes décisives qu'il n'y en a eu dans le match",
      };

    await prisma.statistiqueJoueur.create({
      data: {
        buts,
        minutesJouees,
        note,
        passesdecisive,
        poste,
        titulaire,
        userId: joueurid,
        evenementId: id,
      },
    });

    return {
      success: true,
      message: `Les stats pour le joueur ${MembreJoueur.user.name} ont été ajoutées`,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Erreur serveur lors de l'ajout des statistiques du joueur",
    };
  }
}