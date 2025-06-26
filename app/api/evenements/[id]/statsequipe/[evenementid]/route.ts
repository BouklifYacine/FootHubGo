import { prisma } from "@/prisma";

import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string; evenementid: string };
}

const userId = "TcDbe9JkIpVJ4cnSSPZ2PQtNrrod8nPE";

export async function DELETE(request: NextRequest, { params }: Props) {
  const { id, evenementid } = await params;

  if (!id || !evenementid)
    return NextResponse.json(
      { message: "Evenement inexistant ou incorrect" },
      { status: 400 }
    );

  if (!userId)
    return NextResponse.json(
      {
        message: "L'user n'est pas connecté",
      },
      { status: 403 }
    );

  const MembreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId },
    select: { role: true, equipeId: true },
  });

  const estEntraineur = MembreEquipe?.role === "ENTRAINEUR";

  if (!estEntraineur)
    return NextResponse.json(
      {
        message: "Vous devez etre entraineur pour supprimer des stats de matchs",
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
    where: { evenementId: id },
    select: { resultatMatch: true },
  });

  if (!StatsEquipe?.resultatMatch)
    return NextResponse.json(
      {
        message: "Les stats ne matchs n'existent pas ",
      },
      { status: 400 }
    );

  await prisma.statistiqueEquipe.delete({
    where: { evenementId: evenementid },
  });

  return NextResponse.json({
    message: `Les stats pour l'évenement ${evenement.titre} ont été ajoutés`,
  });
}
