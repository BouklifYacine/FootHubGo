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
        statEquipe: {
          select: { id: true },
        },
        presences: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateDebut: "asc",
      },
    });

    // Transform the response to include hasStats and formatted presences
    const transformedEvents = events.map((e) => ({
      id: e.id,
      titre: e.titre,
      description: e.description,
      lieu: e.lieu,
      typeEvenement: e.typeEvenement,
      dateDebut: e.dateDebut,
      adversaire: e.adversaire,
      weatherData: e.weatherData,
      equipeId: e.equipeId,
      hasStats: !!e.statEquipe,
      presences: e.presences.map((p) => ({
        userId: p.user.id,
        name: p.user.name,
        image: p.user.image,
        statut: p.statut,
      })),
    }));

    return NextResponse.json(transformedEvents, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
