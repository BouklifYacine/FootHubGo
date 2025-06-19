import { CreationPresenceSchema } from "@/features/presences/schemas/presenceschemas";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

const userId = "WXy4jylVHogXq4omfvR0gaGPuYdospk0";

interface Props {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Props) {
  const { id } = await params;

  if (!id)
    return NextResponse.json(
      { message: "Id de l'évenement manquant" },
      { status: 400 }
    );

  if (!userId) {
    return NextResponse.json(
      { message: "Vous devez être connecté pour créer un événement." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const validation = CreationPresenceSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.errors[0].message },
      { status: 400 }
    );
  }
  const { statut } = validation.data;

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  if (!membreEquipe || membreEquipe.role !== "JOUEUR") {
    return NextResponse.json(
      {
        message:
          "Vous devez être joueur d'une équipe pour indiquer votre présence a un évenement.",
      },
      { status: 403 }
    );
  }

  const presenceEnregistree = await prisma.presence.upsert({
      where: {
        userId_evenementId: {
          userId: userId,
          evenementId: id, // Utilisation de l'eventId provenant des paramètres de la route
        },
      },
      update: {
        statut: statut,
      },
      create: {
        userId: userId,
        evenementId: id, // Utilisation de l'eventId provenant des paramètres de la route
        statut: statut,
        dateCreation: new Date(),
      },
    });

    // 6. Renvoyer une réponse de succès
    return NextResponse.json(
      {
        message: "Votre présence a été enregistrée avec succès.",
        presence: presenceEnregistree,
      },
      { status: 201 } // 201 Created
    );
}
