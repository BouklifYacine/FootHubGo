import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;
  if (!userId)
    return NextResponse.json("Vous n'êtes pas connecté", { status: 400 });

  const membre = await prisma.membreEquipe.findFirst({
    where: { userId },
    include: { equipe: true },
  });

  if (!membre) {
    return NextResponse.json({
      equipe: null,
      membres: [],
      role: "SANSCLUB",
    });
  }

  const membres = await prisma.membreEquipe.findMany({
    where: { equipeId: membre.equipeId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          email: true,
          blessures: {
            where: {
              equipeId: membre.equipeId, 
              endDate: {
                gte: new Date(), 
              },
            },
            select: {
              id: true,
              type: true,
              startDate: true,
              endDate: true,
              description: true,
            },
          },
        },
      },
    },
  });

  const membresAvecStatut = membres.map((m) => ({
    ...m,
    isInujured: m.user.blessures.length > 0, 
  }));

  return NextResponse.json({
    equipe: membre.equipe,
    membres: membresAvecStatut,
    role: membre.role,
  });
}
