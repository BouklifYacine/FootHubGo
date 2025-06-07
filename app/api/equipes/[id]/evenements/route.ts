import { NextRequest, NextResponse } from "next/server";

import dayjs from "dayjs";
import "dayjs/locale/fr";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";
dayjs.locale("fr");

const idUtilisateur = "cm7stg4000000irowgylbnkpq";

export async function GET(
  req: NextRequest,
  { params }: { params: { idEquipe: string } }
) {
  try {
    const equipeId = await params.idEquipe;

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        equipeId,
        userId: idUtilisateur,
        role: { in: ["ENTRAINEUR", "JOUEUR"] },
      },
    });

    if (!membreEquipe) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette équipe" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const debut = url.searchParams.get("debut");
    const fin = url.searchParams.get("fin");
    const type = url.searchParams.get("type");
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: Prisma.EvenementWhereInput = { equipeId };

    if (debut || fin) {
      where.dateDebut = {};

      if (debut) {
        where.dateDebut.gte = new Date(debut);
      }

      if (fin) {
        where.dateDebut.lte = new Date(fin);
      }
    }

    if (type && ["MATCH", "ENTRAINEMENT"].includes(type)) {
      where.typeEvenement = type as "MATCH" | "ENTRAINEMENT";
    }

    const evenements = await prisma.evenement.findMany({
      where,
      orderBy: { dateDebut: "asc" },
      skip,
      take: limit,
      include: {
        presences: {
          where: { userId: idUtilisateur },
          select: { id: true, statut: true },
        },
      },
    });

    const total = await prisma.evenement.count({ where });

    const evenementsFormates = evenements.map((evenement) => {
      const dateObj = dayjs(evenement.dateDebut);

      return {
        ...evenement,
        dateDebutFormatee: dateObj.format("dddd D MMMM YYYY à HH:mm"),
        date: dateObj.format("YYYY-MM-DD"),
        heure: dateObj.format("HH:mm"),
        maPresence: evenement.presences[0] || null,
      };
    });

    return NextResponse.json({
      evenements: evenementsFormates,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des événements" },
      { status: 500 }
    );
  }
}
