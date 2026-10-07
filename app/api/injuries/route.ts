import { FindInjuriesPlayer } from "@/features/injuries/repository/FindInjuriesPlayer";
import { createInjurySchema } from "@/features/injuries/schema/createinjuryschema";
import { GetSessionId } from "@/lib/SessionId/GetSessionId";
import { ZodValidationRequest } from "@/lib/ValidationZodApi/ValidationZodApi";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { FindUserIsPlayer } from "@/features/injuries/repository/FindUserHasClub";

export async function POST(request: NextRequest) {
  try {
    const userId = await GetSessionId();

    if (!userId) {
      return NextResponse.json(
        { message: "Utilisateur non authentifié" },
        { status: 401 }
      );
    }

    const { type, description, endDate } = await ZodValidationRequest(
      request,
      createInjurySchema
    );

    const today = startOfDay(new Date());
    const minEndDate = addDays(today, 3);

    if (isBefore(endDate, today)) {
      return NextResponse.json(
        { message: "La date de fin ne peut pas être antérieure à aujourd'hui." },
        { status: 400 }
      );
    }

    if (isBefore(endDate, minEndDate)) {
      return NextResponse.json(
        { message: "Une blessure doit durer au minimum 3 jours." },
        { status: 400 }
      );
    }

    const playerClubMembership = await FindUserIsPlayer(userId);

    if (!playerClubMembership) {
      return NextResponse.json(
        { message: "Vous devez être un joueur pour déclarer une blessure" },
        { status: 403 }
      );
    }

    const allInjuriesPlayer = await FindInjuriesPlayer(userId);

    const hasActiveInjury = allInjuriesPlayer.some((injury) =>
      isAfter(injury.endDate, today)
    );

    if (hasActiveInjury) {
      return NextResponse.json(
        {
          message:
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

    return NextResponse.json(
      { message: "Une erreur interne est survenue" },
      { status: 500 }
    );
  }
}
