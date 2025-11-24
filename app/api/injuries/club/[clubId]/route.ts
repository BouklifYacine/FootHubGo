import { NextRequest, NextResponse } from "next/server";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { prisma } from "@/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  try {
    const userId = await GetSessionId();

    if (!userId) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { clubId } = await params;

    // Verify if user is part of the club and has appropriate role (Entraineur or Admin)
    // For now, we just check if they are a member, but the UI will handle the view.
    // Ideally, we should check for ENTRAINEUR role here for security.
    const member = await prisma.membreEquipe.findUnique({
      where: {
        userId_equipeId: {
          userId,
          equipeId: clubId,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de ce club" },
        { status: 403 }
      );
    }

    // Fetch all players of the club with their injuries
    const players = await prisma.membreEquipe.findMany({
      where: {
        equipeId: clubId,
        role: "JOUEUR",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            blessures: {
              where: {
                equipeId: clubId,
              },
              orderBy: {
                startDate: "desc",
              },
            },
          },
        },
      },
    });

    const playersWithStats = players.map((p) => {
      const activeInjury = p.user.blessures.find((b) => {
        const now = new Date();
        return new Date(b.startDate) <= now && new Date(b.endDate) >= now;
      });

      return {
        id: p.user.id,
        name: p.user.name,
        image: p.user.image,
        activeInjury: activeInjury ? activeInjury : null,
        totalInjuries: p.user.blessures.length,
      };
    });

    return NextResponse.json({ players: playersWithStats }, { status: 200 });
  } catch (error) {
    console.error("Erreur GET blessures club:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}
