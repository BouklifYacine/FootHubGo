import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Récupérer toutes les équipes
    const equipes = await prisma.equipe.findMany({
      select: {
        id: true,
        nom: true,
        logoUrl: true,
      },
    });

    const resultats = await prisma.statistiqueEquipe.groupBy({
      by: ["equipeId", "resultatMatch"],
      _count: {
        resultatMatch: true,
      },
    });

    const buts = await prisma.statistiqueEquipe.groupBy({
      by: ["equipeId"],
      _sum: {
        butsMarques: true,
        butsEncaisses: true,
      },
    });

    const rawStats = await prisma.statistiqueEquipe.findMany({
      select: {
        equipeId: true,
        resultatMatch: true,
        dateCreation: true,
      },
      orderBy: {
        dateCreation: "desc",
      },
    });

    const classementEquipes = equipes.map((equipe) => {
      // Filtrer les agrégats pour l'équipe en cours
      const equipeResultats = resultats.filter((r) => r.equipeId === equipe.id);
      const equipeButs = buts.find((b) => b.equipeId === equipe.id);

      const victoires =
        equipeResultats.find((r) => r.resultatMatch === "VICTOIRE")?._count
          .resultatMatch || 0;
      const defaites =
        equipeResultats.find((r) => r.resultatMatch === "DEFAITE")?._count
          .resultatMatch || 0;
      const nuls =
        equipeResultats.find((r) => r.resultatMatch === "NUL")?._count
          .resultatMatch || 0;

      const totalMatchs = victoires + defaites + nuls;
      const butsMarques = equipeButs?._sum.butsMarques || 0;
      const butsEncaisses = equipeButs?._sum.butsEncaisses || 0;
      const differenceDeButsGlobale = butsMarques - butsEncaisses;
      const points = victoires * 3 + nuls;

      // Calcul de la forme récente (5 derniers matchs)
      const matchsRecents = rawStats
        .filter((s) => s.equipeId === equipe.id)
        .slice(0, 5)
        .map((s) => s.resultatMatch);

      return {
        equipe: {
          id: equipe.id,
          nom: equipe.nom,
          logo: equipe.logoUrl,
        },
        stats: {
          points,
          matchsJoues: totalMatchs,
          victoires,
          nuls,
          defaites,
          butsMarques,
          butsEncaisses,
          differenceDeButsGlobale,
          formeRecente: matchsRecents,
        },
      };
    });

    const classementTrie = classementEquipes.sort((a, b) => {
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      return b.stats.differenceDeButsGlobale - a.stats.differenceDeButsGlobale;
    });

    return NextResponse.json({
      classement: classementTrie,
      totalEquipes: classementTrie.length,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du classement des équipes:",
      error
    );
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération du classement" },
      { status: 500 }
    );
  }
}
