import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { headers } from "next/headers";

// GET /api/chat/members - Get all club members for new conversation modal
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    // Find user's current team
    const userMembership = await prisma.membreEquipe.findFirst({
      where: { userId },
      select: { equipeId: true },
    });

    if (!userMembership) {
      return NextResponse.json(
        { message: "Vous n'appartenez à aucune équipe" },
        { status: 404 }
      );
    }

    // Get all members of the team (excluding current user)
    const teamMembers = await prisma.membreEquipe.findMany({
      where: {
        equipeId: userMembership.equipeId,
        userId: { not: userId },
      },
      select: {
        role: true,
        poste: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    const members = teamMembers.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      image: member.user.image,
      role: member.role,
      poste: member.poste,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching club members:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
