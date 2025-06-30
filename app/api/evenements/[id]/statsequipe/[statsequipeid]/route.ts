import { auth } from "@/auth";
import { ModifierStatsEquipeSchema } from "@/features/stats/statsequipe/schema/ModifierStatsEquipeSchema";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string; statsequipeid: string };
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { id, statsequipeid } = await params;

  if (!id || !statsequipeid)
    return NextResponse.json(
      { message: "stats inexistant ou incorrect" },
      { status: 400 }
    );

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  const MembreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId },
    select: { role: true, equipeId: true },
  });

  const estEntraineur = MembreEquipe?.role === "ENTRAINEUR";

  if (!estEntraineur)
    return NextResponse.json(
      {
        message:
          "Vous devez etre entraineur pour supprimer des stats de matchs",
      },
      { status: 400 }
    );

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: {
      typeEvenement: true,
      titre: true,
      equipeId: true,
      id: true,
    },
  });

  if (!evenement)
    return NextResponse.json(
      {
        message: "Evenement indisponible",
      },
      { status: 400 }
    );

  const evenementEntrainement = evenement?.typeEvenement === "ENTRAINEMENT";

  if (evenementEntrainement)
    return NextResponse.json(
      {
        message: "Vous ne pouvez pas supprimer un évenement d'entrainement",
      },
      { status: 400 }
    );

  if (evenement.equipeId !== MembreEquipe.equipeId) {
    return NextResponse.json(
      { message: "Cet événement n'appartient pas à votre équipe" },
      { status: 403 }
    );
  }

  const StatsEquipe = await prisma.statistiqueEquipe.findUnique({
    where: { id: statsequipeid },
  });

  if (!StatsEquipe)
    return NextResponse.json(
      {
        message: "Les stats ne matchs n'existent pas ",
      },
      { status: 400 }
    );
  await prisma.$transaction(async (tx) => {
    await tx.statistiqueEquipe.delete({
      where: { id: statsequipeid, equipeId: MembreEquipe.equipeId },
    });
    await tx.statistiqueJoueur.deleteMany({
      where: { evenementId: StatsEquipe.evenementId! },
    });
  });

  return NextResponse.json({
    message: `Les stats pour l'évenement ${evenement.titre} ont été supprimé`,
  });
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id, statsequipeid } = await params;
  const body = await request.json();

  if (!id || !statsequipeid)
    return NextResponse.json(
      { message: "Evenement inexistant ou incorrect" },
      { status: 400 }
    );

  const validation = ModifierStatsEquipeSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(
      { message: validation.error.issues[0].message },
      { status: 400 }
    );

  const {
    butsEncaisses,
    cleanSheet,
    butsMarques,
    competition,
    domicile,
    resultatMatch,
    tirsCadres,
    tirsTotal,
  } = validation.data;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  const MembreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId },
    select: { role: true, equipeId: true },
  });

  const estEntraineur = MembreEquipe?.role === "ENTRAINEUR";

  if (!estEntraineur)
    return NextResponse.json(
      {
        message: "Vous devez etre entraineur pour ajouter des stats de matchs",
      },
      { status: 400 }
    );

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: {
      dateDebut: true,
      typeEvenement: true,
      titre: true,
      adversaire: true,
      equipeId: true,
    },
  });

  if (!evenement)
    return NextResponse.json(
      {
        message: "Evenement indisponible",
      },
      { status: 400 }
    );

  const evenementEntrainement = evenement?.typeEvenement === "ENTRAINEMENT";

  if (evenementEntrainement)
    return NextResponse.json(
      {
        message:
          "Vous ne pouvez pas donner de stats a des évenements d'entrainements",
      },
      { status: 400 }
    );

  if (evenement.equipeId !== MembreEquipe.equipeId) {
    return NextResponse.json(
      { message: "Cet événement n'appartient pas à votre équipe" },
      { status: 403 }
    );
  }

  const StatsEquipe = await prisma.statistiqueEquipe.findUnique({
    where: {
      id: statsequipeid,
      evenementId: id, // Garantit le lien entre stats et événement
    },
  });

  if (!StatsEquipe)
    return NextResponse.json(
      {
        message: "Aucune stats equipe disponible",
      },
      { status: 400 }
    );

  await prisma.statistiqueEquipe.update({
    where: {
      id: statsequipeid,
    },
    data: {
      adversaire: evenement.adversaire || "",
      butsEncaisses,
      cleanSheet,
      butsMarques,
      competition,
      domicile,
      resultatMatch,
      tirsCadres,
      tirsTotal,
      equipeId: MembreEquipe.equipeId,
      evenementId: id,
    },
  });

  return NextResponse.json({
    message: `Les stats pour l'évenement ${evenement.titre} ont été modifié`,
  });
}
