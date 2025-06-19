
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

        MembreEquipe: { 
          take: 1,
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
      const membreEquipe = user.MembreEquipe ? user.MembreEquipe[0] : null;

      const totalMatchs = statsJoueur.length;
      const matchsTitulaire = statsJoueur.filter((stat) => stat.titulaire).length; 
      const totalButs = statsJoueur.reduce((sum, stat) => sum + stat.buts, 0); 
      const totalPasses = statsJoueur.reduce((sum, stat) => sum + stat.passesdécisive, 0); 
      const GA = totalButs + totalPasses; 

      let tempsJeuTotal = 0;
      statsJoueur.forEach((stat) => {
        // Calcule le temps de jeu total. Utilise `minutesJouees` si disponible, sinon une estimation (90 min si titulaire, 30 si remplaçant).
        // L'opérateur `??` gère le cas où `minutesJouees` est null.
        tempsJeuTotal += stat.minutesJouees ?? (stat.titulaire ? 90 : 30);
      });

      const butsPar90 = tempsJeuTotal > 0 ? (totalButs / tempsJeuTotal) * 90 : 0;
      const passesPar90 = tempsJeuTotal > 0 ? (totalPasses / tempsJeuTotal) * 90 : 0;
      const GAPar90 = butsPar90 + passesPar90;

      let noteMoyenne = 0;
      if (totalMatchs > 0) {
        noteMoyenne = statsJoueur.reduce((sum, stat) => sum + stat.note, 0) / totalMatchs;
      }


      const arrondir = (n: number | null | undefined): number => {
        if (n === null || n === undefined) return 0; 
        return Math.round(n * 100) / 100;
      };

      return {
        joueur: {
          id: user.id,
          nom: user.name,
          image: user.image || null,
        },
        equipe: membreEquipe?.equipe ? { 
          id: membreEquipe.equipe.id,
          nom: membreEquipe.equipe.nom,
          logoUrl: membreEquipe.equipe.logoUrl, 
        } : null, // Sinon, null
        stats: {
          totalMatchs,
          matchsTitulaire,
          totalButs,
          totalPasses,
          GA, 
     
          GA_Match: totalMatchs > 0 ? arrondir(GA / totalMatchs) : 0, 
          noteMoyenne: arrondir(noteMoyenne),
          tempsJeuTotal, 
          butsPar90: arrondir(butsPar90),
          passesPar90: arrondir(passesPar90), 
          GAPar90: arrondir(GAPar90), 
        },
      };
    });

    const classementComplet = [...statsJoueurs].sort((a, b) => {
      if (b.stats.GA !== a.stats.GA) {
        return b.stats.GA - a.stats.GA;
      }
      if (b.stats.totalButs !== a.stats.totalButs) {
        return b.stats.totalButs - a.stats.totalButs;
      }
      return b.stats.noteMoyenne - a.stats.noteMoyenne;
    });

    return NextResponse.json({
      totalJoueurs: statsJoueurs.length,
      classement: classementComplet
    });
  } catch (error) {
    // Log l'erreur et retourne une réponse d'erreur serveur.
    console.error("Erreur lors de la récupération des statistiques des joueurs:", error);
  }
}