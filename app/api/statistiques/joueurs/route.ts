import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const utilisateurs = await prisma.user.findMany({
      where: {
        statsJoueur: {
          some: {},
        },
      },
      include: {
        statsJoueur: true,
        membreEquipe: {
          include: {
            equipe: {
              select: {
                id: true,
                nom: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });


    const statsJoueurs = utilisateurs.map((user) => {
      const statsJoueur = user.statsJoueur || [];

      const totalMatchs = statsJoueur.length;
      const matchsTitulaire = statsJoueur.filter((stat) => stat.titulaire).length;
      const totalButs = statsJoueur.reduce((sum, stat) => sum + stat.buts, 0);
      const totalPasses = statsJoueur.reduce((sum, stat) => sum + stat.passesdécisive, 0);
      const GA = totalButs + totalPasses;

      let tempsJeuTotal = 0;
      statsJoueur.forEach((stat) => {
        tempsJeuTotal += stat.minutesJouees || (stat.titulaire ? 90 : 30);
      });

      const butsPar90 = tempsJeuTotal > 0 ? (totalButs / tempsJeuTotal) * 90 : 0;
      const passesPar90 = tempsJeuTotal > 0 ? (totalPasses / tempsJeuTotal) * 90 : 0;
      const GAPar90 = butsPar90 + passesPar90;

      let noteMoyenne = 0;
      if (totalMatchs > 0) {
        noteMoyenne = statsJoueur.reduce((sum, stat) => sum + stat.note, 0) / totalMatchs;
      }

      const arrondir = (n: number) => Math.round(n * 100) / 100;

      return {
        joueur: {
          id: user.id,
          nom: user.name,
          image: user.image,
        },
        equipe: user.membreEquipe?.equipe || null,
        stats: {
          totalMatchs,
          matchsTitulaire,
          totalButs,
          totalPasses,
          GA,
          GA_Match: arrondir(GA / totalMatchs) || 0,
          noteMoyenne: arrondir(noteMoyenne),
          tempsJeuTotal,
          butsPar90: arrondir(butsPar90),
          passesPar90: arrondir(passesPar90),
          GAPar90: arrondir(GAPar90),
        },
      };
    });

    const classementComplet = [...statsJoueurs].sort((a, b) => b.stats.GA - a.stats.GA);

    return NextResponse.json({
      totalJoueurs: statsJoueurs.length,
      classement: classementComplet
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}