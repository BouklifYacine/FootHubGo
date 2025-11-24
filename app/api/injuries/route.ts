import { FindInjuriesPlayer } from "@/features/injuries/repository/FindInjuriesPlayer";
import { createInjurySchema } from "@/features/injuries/schema/createinjuryschema";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { FindUserIsPlayer } from "@/features/injuries/repository/FindUserHasClub";

export async function POST(request: NextRequest) {
  try {
    const userId = await GetSessionId();

    if (!userId) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { type, description, endDate } = await ZodValidationRequest(
      request,
      createInjurySchema
    );

    const today = dayjs().startOf("day");
    const minEndDate = today.add(3, "day");

    if (dayjs(endDate).isBefore(today)) {
      return NextResponse.json(
        { error: "La date de fin ne peut pas être antérieure à aujourd'hui." },
        { status: 400 }
      );
    }

    if (dayjs(endDate).isBefore(minEndDate)) {
      return NextResponse.json(
        { error: "Une blessure doit durer au minimum 3 jours." },
        { status: 400 }
      );
    }

    const playerClubMembership = await FindUserIsPlayer(userId);

    if (!playerClubMembership) {
      return NextResponse.json(
        { error: "Vous devez être un joueur pour déclarer une blessure" },
        { status: 403 }
      );
    }

    const allInjuriesPlayer = await FindInjuriesPlayer(userId);

    const hasActiveInjury = allInjuriesPlayer.some((injury) =>
      dayjs(injury.endDate).isAfter(today)
    );

    if (hasActiveInjury) {
      return NextResponse.json(
        {
          error:
            "Vous avez déjà une blessure active. Vous ne pouvez pas en déclarer une nouvelle.",
        },
        { status: 400 }
      );
    }

    const newInjury = await prisma.blessure.create({
      data: {
        type,
        description,
        startDate: new Date(),
        endDate,
        userId,
        equipeId: playerClubMembership.equipeId,
      },
    });

    return NextResponse.json(
      {
        message: "Blessure créée avec succès",
        injuryType: newInjury,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création de la blessure:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}
