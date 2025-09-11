import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

type StatWithSum = {
  userId: string;
  _sum: {
    buts?: number | null;
    passesdecisive?: number | null;
  };
};

type TeamPlayer = {
  userId: string;
  poste: string | null;        
  user: {
    name: string;
    image: string | null;      
  };
};


export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour accéder à vos présences" },
        { status: 401 }
      );
    }

    const id = session.user.id;

    const TeamMember = await prisma.membreEquipe.findFirst({
      where: { userId: id },
      include: { equipe: true },
    });

    if (!TeamMember)
      return NextResponse.json("Vous n'etes pas membre du club", {
        status: 400,
      });

    const Player = TeamMember.role === "JOUEUR";

    const includePlayerStats = Player
      ? {
          statsJoueur: {
            select: { note: true },
            where: { userId: id },
          },
        }
      : {};

    const TeamResultWithPlayerStats = await prisma.evenement.findMany({
      where: {
        equipeId: TeamMember.equipeId,
        statEquipe: { isNot: null },
      },
      select: {
        id: true,             
        lieu: true,
        typeEvenement: true,
        dateDebut: true,
        statEquipe: {
          select: {
            resultatMatch: true,
            adversaire: true,
            butsMarques: true,
            butsEncaisses: true,
          },
        },
        ...includePlayerStats,
      },
      orderBy: {
        dateDebut: "desc",
      },
    });

    const FiveLastResults = TeamResultWithPlayerStats.slice(0, 5);

    const currenDate = new Date();

    const UpcomingEvents = await prisma.evenement.findMany({
      where: { equipeId: TeamMember.equipeId, dateDebut: { gte: currenDate } },
      select: {
        id: true,             
        typeEvenement: true,
        dateDebut: true,
        lieu: true,
      },
      orderBy: { dateDebut: "asc" },
    });

    const ThreeNextEvents = UpcomingEvents.slice(0, 3);

    const TotalTeamMembers = await prisma.membreEquipe.count({
      where: {
        equipeId: TeamMember.equipeId,
      },
    });

  const teamPlayers = await prisma.membreEquipe.findMany({
  where: { equipeId: TeamMember.equipeId },
  select: {                    
    userId: true,              
    poste: true,               
    user: { 
      select: { 
        id: true,          
        name: true, 
        image: true,        
      } 
    } 
  },
});


    const PlayerIds = teamPlayers.map((p) => p.userId);

    const topGoalScorer = await prisma.statistiqueJoueur.groupBy({
      by: ["userId"],
      where: { userId: { in: PlayerIds } },
      _sum: { buts: true },
      orderBy: { _sum: { buts: "desc" } },
      take: 5,
    });

    const TopPasseur = await prisma.statistiqueJoueur.groupBy({
      by: ["userId"],
      where: { userId: { in: PlayerIds } },
      _sum: { passesdecisive: true },
      orderBy: { _sum: { passesdecisive: "desc" } },
      take: 5,
    });

   const addPlayerNames = (
  stats: StatWithSum[],
  teamPlayers: TeamPlayer[]
) => {
  return stats.map((stat) => {
    const player = teamPlayers.find((p) => p.userId === stat.userId);
    return {
      id: stat.userId,       
      ...stat,
      playerName: player?.user?.name,
      playerImage: player?.user?.image,    
      playerPosition: player?.poste,       
    };
  });
};


    const buteursWithNames = addPlayerNames(topGoalScorer, teamPlayers);
    const passeursWithNames = addPlayerNames(TopPasseur, teamPlayers);

    return NextResponse.json({
      role: TeamMember.role,

      team: {
        name: TeamMember.equipe.nom,
        level: TeamMember.equipe.niveau,
        totalMembers: TotalTeamMembers,
      },

      matches: {
        recent: FiveLastResults,       
        upcoming: ThreeNextEvents,     
      },

      leaderboards: {
        topScorers: buteursWithNames,   
        topAssisters: passeursWithNames, 
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération infos de l'accueil", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
