// (server-actions)/EvenementEquipe-actions.ts
"use server";

import dayjs from "dayjs";
import "dayjs/locale/fr";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";
import {
  FiltreEvenements,
  filtreEvenementsSchema,
} from "../schemas/SchemaEvenementv2";
import {
  EvenementListeErrorResponse,
  EvenementListeResponse,
  EvenementListeSuccessResponse,
} from "../types/EvenementsTypes";
import { headers } from "next/headers";
import { auth } from "@/auth";

dayjs.locale("fr");

export async function getEvenementsEquipe(
  equipeId: string,
  filtres: FiltreEvenements = { type: "TOUS", limit: 5, page: 1 }
): Promise<EvenementListeResponse> {
  try {
    // Validation des filtres
    const validationFiltres = filtreEvenementsSchema.safeParse(filtres);
    if (!validationFiltres.success) {
      const errorResponse: EvenementListeErrorResponse = {
        success: false,
        message: "Filtres invalides",
      };
      return errorResponse;
    }

    // Utiliser les filtres validés
    const filtresValides = validationFiltres.data;

    // Récupération de l'utilisateur connecté
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user?.id;

    if (!userId) {
      const errorResponse: EvenementListeErrorResponse = {
        success: false,
        message: "Vous devez être connecté",
      };
      return errorResponse;
    }

    // Vérification que l'utilisateur est membre de l'équipe
    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId,
        equipeId,
        role: { in: ["ENTRAINEUR", "JOUEUR"] },
      },
    });

    if (!membreEquipe) {
      const errorResponse: EvenementListeErrorResponse = {
        success: false,
        message: "Vous n'êtes pas membre de cette équipe",
      };
      return errorResponse;
    }

    // Gestion des paramètres de pagination
    const limit = filtresValides.limit;
    const page = filtresValides.page;
    const skip = (page - 1) * limit;

    // Construction de la requête WHERE
    const where: Prisma.EvenementWhereInput = { equipeId };

    if (filtresValides.debut || filtresValides.fin) {
      where.dateDebut = {};

      if (filtresValides.debut) {
        where.dateDebut.gte = new Date(filtresValides.debut);
      }

      if (filtresValides.fin) {
        where.dateDebut.lte = new Date(filtresValides.fin);
      }
    }

    if (filtresValides.type && filtresValides.type !== "TOUS") {
      where.typeEvenement = filtresValides.type;
    }

    // Récupération des événements
    const evenements = await prisma.evenement.findMany({
      where,
      orderBy: { dateDebut: "asc" },
      skip,
      take: limit,
      include: {
        presences: {
          where: { userId },
          select: { id: true, statut: true },
        },
      },
    });

    const idsEvenements = evenements.map((e) => e.id);

    // Récupération des statistiques joueur
    const statistiquesJoueur = await prisma.statistiqueJoueur.findMany({
      where: {
        userId,
        evenementId: { in: idsEvenements },
      },
    });

    // Récupération des statistiques équipe
    const statistiquesEquipe = await prisma.statistiqueEquipe.findMany({
      where: {
        equipeId,
        evenementId: { in: idsEvenements },
      },
    });

    const total = await prisma.evenement.count({ where });
    const evenementsFormates: any[] = evenements.map((evenement) => {
      const dateObj = dayjs(evenement.dateDebut);

      const statsJoueur =
        statistiquesJoueur.find((s) => s.evenementId === evenement.id) || null;
      const statsEquipe =
        statistiquesEquipe.find((s) => s.evenementId === evenement.id) || null;

      return {
        ...evenement,
        dateDebutFormatee: dateObj.format("dddd D MMMM YYYY à HH:mm"),
        date: dateObj.format("YYYY-MM-DD"),
        heure: dateObj.format("HH:mm"),
        maPresence: evenement.presences[0] || null,
        mesStatistiques: statsJoueur,
        statistiquesEquipe: statsEquipe,
      };
    });

    const maintenant = new Date();
    const evenementsAVenir = evenementsFormates.filter(
      (e) => new Date(e.dateDebut) > maintenant
    );
    const evenementsPassés = evenementsFormates.filter(
      (e) => new Date(e.dateDebut) <= maintenant
    );

    const successResponse: EvenementListeSuccessResponse = {
      success: true,
      evenementsAVenir,
      evenementsPassés,
      pagination: {
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
        page,
        limit,
      },
    };

    return successResponse;
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    const errorResponse: EvenementListeErrorResponse = {
      success: false,
      message: "Erreur lors de la récupération des événements",
    };
    return errorResponse;
  }
}
