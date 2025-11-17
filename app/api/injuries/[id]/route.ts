import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { FindUserIsPlayer } from "@/features/injuries/repository/FindUserHasClub";
import { FindInjuryById } from "@/features/injuries/repository/FindInjuryById";
import { prisma } from "@/prisma";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { createInjurySchema } from "@/features/injuries/schema/createinjuryschema";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await GetSessionId();
    if (!userId) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const injuryId = params.id;

    const { type, description, endDate } = await ZodValidationRequest(request, createInjurySchema);

    const injury = await FindInjuryById(injuryId, userId);
    if (!injury) {
      return NextResponse.json({ error: "Blessure introuvable ou accès refusé" }, { status: 404 });
    }

    const today = dayjs().startOf("day");
    if (dayjs(endDate).isBefore(today)) {
      return NextResponse.json(
        { error: "La date de fin ne peut pas être antérieure à aujourd'hui." },
        { status: 400 }
      );
    }

    if (dayjs(endDate).isBefore(today.add(3, "day"))) {
      return NextResponse.json(
        { error: "Une blessure doit durer au minimum 3 jours." },
        { status: 400 }
      );
    }

    const updatedInjury = await prisma.blessure.update({
      where: { id: injuryId },
      data: { type, description, endDate },
      include: {
        equipe: {
          select: {
            nom: true,
          },
        },
      },
    });

    return NextResponse.json({ message: "Blessure mise à jour avec succès", injury: updatedInjury }, { status: 200 });
  } catch (error) {
    console.error("Erreur PATCH blessure:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await GetSessionId();

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const player = await FindUserIsPlayer(userId);

    if (!player) {
      return NextResponse.json(
        { error: "Vous devez être joueur dans un club pour supprimer une blessure" },
        { status: 403 }
      );
    }

    const injuryId = params.id;

    const injury = await FindInjuryById(injuryId, userId);

    if (!injury) {
      return NextResponse.json({ error: "Blessure introuvable ou accès refusé" }, { status: 404 });
    }

   const now = dayjs();

if (now.isAfter(dayjs(injury.endDate))) {
  return NextResponse.json(
    { error: "Impossible de supprimer une blessure déjà terminée" },
    { status: 400 }
  );
}
    await prisma.blessure.delete({
      where: { id: injuryId },
    });

    return NextResponse.json(
      { message: "Blessure supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur DELETE blessure:", error);
    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}
