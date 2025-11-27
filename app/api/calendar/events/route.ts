import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await GetSessionId();

    const userTeam = await prisma.membreEquipe.findFirst({
      where: {
        userId: userId,
      },
      select: {
        equipeId: true,
      },
    });

    if (!userTeam) {
      return NextResponse.json(
        { message: "Utilisateur sans club" },
        { status: 404 }
      );
    }

    const events = await prisma.evenement.findMany({
      where: {
        equipeId: userTeam.equipeId,
      },
      select: {
        id: true,
        titre: true,
        description: true,
        lieu: true,
        typeEvenement: true,
        dateDebut: true,
        adversaire: true,
        weatherData: true,
        equipeId: true,
      },
      orderBy: {
        dateDebut: "asc",
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
