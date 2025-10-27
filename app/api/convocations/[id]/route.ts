import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }
) {
  const {id : convocationId} = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  const convocation = await prisma.convocation.findUnique({
    where: { id: convocationId },
    select: {
      id: true,
      userId: true,
      statut: true,
      evenementId: true,
      evenement: {
        select: {
          dateDebut: true,
          equipeId: true,
        },
      },
    },
  });

  if (!convocation) {
    return NextResponse.json(
      { message: "Convocation introuvable" },
      { status: 404 }
    );
  }

  const coach = await prisma.membreEquipe.findFirst({
    where: {
      userId: userId,
      equipeId: convocation.evenement.equipeId,
      role: "ENTRAINEUR",
    },
  });

  if (!coach) {
    return NextResponse.json(
      {
        message:
          "Vous devez être l'entraîneur de cette équipe pour annuler une convocation",
      },
      { status: 403 }
    );
  }

  const now = dayjs();
  const eventDate = dayjs(convocation.evenement.dateDebut);

  if (now.isAfter(eventDate)) {
    return NextResponse.json(
      {
        message:
          "L'événement est déjà passé, impossible d'annuler la convocation",
      },
      { status: 400 }
    );
  }

  const diffHours = eventDate.diff(now, "hour", true);
  if (diffHours < 6) {
    return NextResponse.json(
      {
        message:
          "Vous devez annuler la convocation au moins 6h avant le début du match",
      },
      { status: 400 }
    );
  }

  await prisma.convocation.delete({
    where: { id: convocationId },
  });

  return NextResponse.json(
    {
      message: "La convocation a été annulée avec succès",
    },
    { status: 200 }
  );
}
