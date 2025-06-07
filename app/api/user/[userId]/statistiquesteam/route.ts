import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { userId: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { userId } = await params;
  
  const session = await auth();
  const idUtilisateurConnecte = session?.user?.id;
  
  try {
    if (!idUtilisateurConnecte) {
      return NextResponse.json(
        { message: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const membreEquipe = await prisma.membreEquipe.findUnique({
      where: { userId: userId },
      include: { equipe: true }
    });

    if (!membreEquipe) {
      return NextResponse.json(
        { message: "Cet utilisateur n'appartient à aucune équipe" },
        { status: 404 }
      );
    }

    if (userId !== idUtilisateurConnecte) {
      const membreMemeEquipe = await prisma.membreEquipe.findFirst({
        where: {
          userId: idUtilisateurConnecte,
          equipeId: membreEquipe.equipeId
        }
      });

      if (!membreMemeEquipe) {
        return NextResponse.json(
          { message: "Vous n'êtes pas autorisé à voir les statistiques de cette équipe" },
          { status: 403 }
        );
      }
    }

    const equipeId = membreEquipe.equipeId;
    const statsEquipe = await prisma.statistiqueEquipe.findMany({
      where: { equipeId: equipeId },
      include: {
        evenement: {
          select: {
            titre: true,
            dateDebut: true
          }
        }
      }
    });

    const totalMatchs = statsEquipe.length;
    const victoires = statsEquipe.filter(stat => stat.resultatMatch === "VICTOIRE").length;
    const defaites = statsEquipe.filter(stat => stat.resultatMatch === "DEFAITE").length;
    const nuls = statsEquipe.filter(stat => stat.resultatMatch === "MATCH_NUL").length;
    const butsMarques = statsEquipe.reduce((sum, stat) => sum + stat.butsMarques, 0);
    const butsEncaisses = statsEquipe.reduce((sum, stat) => sum + stat.butsEncaisses, 0);
    const differenceDeButsGlobale = butsMarques - butsEncaisses;
    const cleanSheets = statsEquipe.filter(stat => stat.cleanSheet).length;
    
    const points = (victoires * 3) + nuls;
    const tauxVictoire = totalMatchs > 0 ? Math.round((victoires / totalMatchs) * 100) : 0;
    
    const moyenneButsMarques = totalMatchs > 0 ? Number((butsMarques / totalMatchs).toFixed(2)) : 0;
    const moyenneButsEncaisses = totalMatchs > 0 ? Number((butsEncaisses / totalMatchs).toFixed(2)) : 0;

    const reponse = {
      StatistiqueEquipe: {
        points,
        totalMatchs,
        victoires,
        nuls,
        defaites,
        butsMarques,
        butsEncaisses,
        differenceDeButsGlobale,
        cleanSheets,
        tauxVictoire,
        moyenneButsMarques,
        moyenneButsEncaisses
      }
    };
    
    return NextResponse.json(reponse);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques d'équipe:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}