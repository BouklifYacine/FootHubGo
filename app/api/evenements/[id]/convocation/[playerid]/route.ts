import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";

export async function POST(request: NextRequest,{ params }: { params: { id: string; playerid: string } }) {
  const { id: evenementid, playerid: playerId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const idUtilisateur = session?.user?.id;

//  const idUtilisateur = "2cXsE8BlLpdHKiJdOrDXPpi7rmHDXhK9"

  if (!idUtilisateur) {
    return NextResponse.json(
      { message: "Authentification requise" },
      { status: 401 }
    );
  }

  const Coach = await prisma.membreEquipe.findFirst({
    where: { userId: idUtilisateur },
    select: { role: true, equipeId: true },
  });

  const Player = await prisma.membreEquipe.findFirst({
    where: { userId: playerId },
    select: {
      role: true,
      isLicensed: true,
      equipeId: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!Player) {
    return NextResponse.json(
      { message: "Ce joueur n'existe pas" },
      { status: 400 }
    );
  }

    if (!Coach) {
    return NextResponse.json(
      { message: "Vous n'avez pas d'équipe" },
      { status: 403 }
    );
  }

   if (Coach.role !== "ENTRAINEUR") {
    return NextResponse.json(
      { message: "Vous devez être entraîneur pour envoyer des convocations de matchs" },
      { status: 403 }
    );
  }

  if (Player.role === "ENTRAINEUR") {
    return NextResponse.json(
      { message: "Vous ne pouvez pas convoquer un entraîneur" },
      { status: 400 }
    );
  }

  const Event = await prisma.evenement.findUnique({
    where: { id: evenementid },
    select: {
      id: true,
      typeEvenement: true,
      dateDebut: true,
      equipeId: true,
      Convocation: true,
    },
  });

  if (!Event) {
    return NextResponse.json(
      { message: "Cet événement n'existe pas" },
      { status: 400 }
    );
  }

  if (Event.typeEvenement === "ENTRAINEMENT") {
    return NextResponse.json(
      { message: "Vous ne pouvez pas envoyer de convocation pour des entraînements" },
      { status: 400 }
    );
  }

  const team = await prisma.equipe.findFirst({
    where: { id: Event.equipeId },
    select: { id: true },
  });

  if (!team) {
    return NextResponse.json(
      { message: "Cette équipe n'existe pas" },
      { status: 404 }
    );
  }

  if (team.id !== Coach.equipeId) {
    return NextResponse.json(
      { message: "Vous ne faites pas partie de cette équipe" },
      { status: 400 }
    );
  }

  if (Player.equipeId !== Event.equipeId) {
    return NextResponse.json(
      { message: "Le joueur ne fait pas partie de l'équipe de cet événement" },
      { status: 400 }
    );
  }

  const PlayerConvocated = await prisma.convocation.findFirst({
    where: {
      userId: playerId,
      evenementId: evenementid,
    },
    select: {
      dateEnvoi: true,
      evenementId: true,
      statut: true,
    },
  });

  if (PlayerConvocated) {
    return NextResponse.json(
      { message: "Ce joueur a déjà une convocation" },
      { status: 409 }
    );
  }

  const InjuredPlayer = await prisma.blessure.findFirst({
    where: { userId: playerId },
    select: {
      startDate: true,
      endDate: true,
    },
  });

  if (
    InjuredPlayer && InjuredPlayer.startDate && InjuredPlayer.endDate &&
    dayjs(InjuredPlayer.startDate).isBefore(dayjs(Event.dateDebut).add(1, "day")) && dayjs(InjuredPlayer.endDate).isAfter(dayjs(Event.dateDebut).subtract(1, "day"))
  ) {
    return NextResponse.json(
      { message: "Ce joueur est blessé pendant l'événement et ne peut être convoqué" },
      { status: 400 }
    );
  }

  if (dayjs().isAfter(dayjs(Event.dateDebut))) {
    return NextResponse.json(
      { message: "L'événement est déjà passé, impossible d'envoyer une convocation" },
      { status: 400 }
    );
  }

  const diffHours = dayjs(Event.dateDebut).diff(dayjs(), "hour", true);
  if (diffHours < 24) {
    return NextResponse.json(
      { message: "La convocation doit être envoyée au moins 24h avant le match" },
      { status: 400 }
    );
  }

  await prisma.convocation.create({
    data: {
      userId: playerId,
      evenementId: evenementid,
      statut: "EN_ATTENTE",
      dateEnvoi: new Date(),
    },
  });

  return NextResponse.json(
    { message: `Convocation envoyée à ${Player.user.name}` },
    { status: 201 }
  );
}
