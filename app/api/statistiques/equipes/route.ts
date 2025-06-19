import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
 
    const equipes = await prisma.equipe.findMany({
      include: {
        statsEquipe: true
      }
    });
    
    const classementEquipes = equipes.map(equipe => {
      const statsEquipe = equipe.statsEquipe || [];
      
      const totalMatchs = statsEquipe.length;
      const victoires = statsEquipe.filter(stat => stat.resultatMatch === "VICTOIRE").length;
      const defaites = statsEquipe.filter(stat => stat.resultatMatch === "DEFAITE").length;
      const nuls = statsEquipe.filter(stat => stat.resultatMatch === "NUL").length;
      const butsMarques = statsEquipe.reduce((sum, stat) => sum + stat.butsMarques, 0);
      const butsEncaisses = statsEquipe.reduce((sum, stat) => sum + stat.butsEncaisses, 0);
      const differenceDeButsGlobale = butsMarques - butsEncaisses;
      
      const points = (victoires * 3) + nuls;
      
      const matchsRecents = [...statsEquipe]
        .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
        .slice(0, 5)
        .map(match => match.resultatMatch);
      
      return {
        equipe: {
          id: equipe.id,
          nom: equipe.nom,
          logo: equipe.logoUrl
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
          formeRecente: matchsRecents
        }
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
      totalEquipes: classementTrie.length
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du classement des équipes:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération du classement" },
      { status: 500 }
    );
  }
}