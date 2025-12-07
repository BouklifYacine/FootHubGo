import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await GetSessionId();

    const myRequests = await prisma.demandeAdhesion.findMany({
      where: {
        userId: userId,
      },
      include: {
        equipe: {
          select: {
            id: true,
            nom: true,
            logoUrl: true,
            niveau: true, 
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(myRequests);

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Erreur interne" }, { status: 500 });
  }
}