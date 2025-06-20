
import { ModifierEvenementSchema } from "@/features/evenements/schemas/ModificationEvenementsSchema";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

const userId = "Lm9B28oAI4ShwdFuVDgGevzPedyHcppb";


export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const body = await request.json();

  const validation = ModifierEvenementSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.errors[0].message },
      { status: 400 }
    );
  }
  const DataaJour = validation.data;

  if (!id)
    return NextResponse.json(
      { message: "Id de l'évenement manquant" },
      { status: 400 }
    );

  if (!userId) {
    return NextResponse.json(
      { message: "Vous devez être connecté pour créer un événement." },
      { status: 401 } // 401 Unauthorized est plus approprié ici
    );
  }

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
    return NextResponse.json(
      {
        message:
          "Vous devez être entraîneur d'une équipe pour créer des événements.",
      },
      { status: 403 }
    );
  }

  const Evenementexistant = await prisma.evenement.findUnique({
    where: { id },
  });
  if (!Evenementexistant) {
    return NextResponse.json(
      { message: "Événement introuvable." },
      { status: 404 }
    );
  }
  if (Evenementexistant.equipeId !== membreEquipe.equipeId) {
    return NextResponse.json(
      {
        message: "Vous ne pouvez pas modifier un événement d'une autre équipe.",
      },
      { status: 403 }
    );
  }

  const Evenementajour = await prisma.evenement.update({
    where: { id },
    data: DataaJour,
  });
  return NextResponse.json(
    { message: "Événement mis à jour.", evenement: Evenementajour },
    { status: 200 }
  );
}
