import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "ID de l'événement manquant" },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!userId) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    const evenementunique = await prisma.evenement.findUnique({
      where: { id },
      select: {
        id: true,
        equipeId: true,
      },
    });

    if (!evenementunique) {
      return NextResponse.json(
        { error: "Événement introuvable" },
        { status: 404 }
      );
    }

    const isMember = await prisma.membreEquipe.findFirst({
      where: {
        userId: userId,
        equipeId: evenementunique.equipeId,
      },
    });

    if (!isMember) {
      return NextResponse.json(
        {
          error:
            "Accès refusé : vous n'êtes pas membre de l'équipe organisatrice",
        },
        { status: 403 }
      );
    }

    const evenement = await prisma.evenement.findUnique({
      where: { id },
      select: {
        titre: true,
        typeEvenement: true,
        dateDebut: true,
        lieu: true,
        adversaire: true,
      },
    });

    return NextResponse.json(evenement);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
