import { auth } from "@/auth";
import { ModifierStatsJoueurSchema } from "@/features/stats/statsjoueur/schema/ModifierStatsJoueurSchema";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string; joueurid: string; statistiqueid: string };
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { id, joueurid, statistiqueid } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!userId)
    return NextResponse.json(
      {
        message: "L'user n'est pas connecté",
      },
      { status: 403 }
    );

  if (!id || !joueurid || !statistiqueid)
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

  const StatsJoueur = await prisma.statistiqueJoueur.findFirst({
    where: { userId: joueurid, id: statistiqueid },
    select: { buts: true },
  });

  if (!StatsJoueur)
    return NextResponse.json(
      {
        message: "Les stats de ce joueuur n'existent pas ",
      },
      { status: 400 }
    );

  await prisma.statistiqueJoueur.delete({
    where: { id: statistiqueid },
  });

  return NextResponse.json({
    message: `Les stats pour l'évenement ${evenement.titre} ont été supprimés`,
  });
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id, joueurid, statistiqueid } = await params;
  const body = await request.json();

  if (!id || !joueurid || !statistiqueid)
    return NextResponse.json(
      { message: "Événement ou joueur inexistant ou incorrect" },
      { status: 400 }
    );

  const validation = ModifierStatsJoueurSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(
      { message: validation.error.issues[0].message },
      { status: 400 }
    );

  const { buts, minutesJouees, note, passesdecisive, poste, titulaire } =
    validation.data;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

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
        message:
          "Vous devez être entraîneur pour modifier des stats pour un joueur",
      },
      { status: 400 }
    );

  const evenement = await prisma.evenement.findUnique({
    where: { id },
    select: {
      dateDebut: true,
      typeEvenement: true,
      titre: true,
      equipeId: true,
      presences: true,
    },
  });

  if (!evenement)
    return NextResponse.json(
      {
        message: "Événement indisponible",
      },
      { status: 400 }
    );

  const evenementEntrainement = evenement?.typeEvenement === "ENTRAINEMENT";

  if (evenementEntrainement)
    return NextResponse.json(
      {
        message:
          "Vous ne pouvez pas modifier des stats pour des événements d'entraînement",
      },
      { status: 400 }
    );

  if (evenement.equipeId !== MembreEquipe.equipeId) {
    return NextResponse.json(
      { message: "Cet événement n'appartient pas à votre équipe" },
      { status: 403 }
    );
  }

  const joueurPresent = evenement.presences.find((i) => i.userId === joueurid);

  const MembreJoueur = await prisma.membreEquipe.findFirst({
    where: { userId: joueurid, equipeId: evenement.equipeId },
    select: { role: true, userId: true, user: { select: { name: true } } },
  });

  if (joueurPresent?.statut !== "PRESENT" || MembreJoueur?.role !== "JOUEUR")
    return NextResponse.json(
      {
        message:
          "Ce joueur n'est pas présent sur cet événement ou n'est pas un joueur",
      },
      { status: 400 }
    );

  const ancienneStat = await prisma.statistiqueJoueur.findUnique({
    where: {
      id: statistiqueid,
      userId: joueurid,
      evenementId: id,
    },
    select: {
      buts: true,
      passesdecisive: true,
    },
  });

  if (!ancienneStat)
    return NextResponse.json(
      {
        message: "Statistiques introuvables pour ce joueur",
      },
      { status: 404 }
    );

  const statsequipeexistante = await prisma.statistiqueEquipe.findUnique({
    where: { evenementId: id },
    select: { butsMarques: true },
  });

  if (!statsequipeexistante)
    return NextResponse.json(
      {
        message: "Vous devez d'abord enregistrer les stats de l'équipe",
      },
      { status: 400 }
    );

  const TeamStats = await prisma.statistiqueJoueur.aggregate({
    where: {
      evenementId: id,
      id: { not: statistiqueid },
    },
    _sum: {
      buts: true,
      passesdecisive: true,
    },
  });

  const nouveauTotalButs = (TeamStats._sum.buts || 0) + buts!;
  const nouveauTotalPasses =
    (TeamStats._sum.passesdecisive || 0) + passesdecisive!;

  if (nouveauTotalButs > statsequipeexistante.butsMarques) {
    return NextResponse.json(
      {
        message: `Le total des buts (${nouveauTotalButs}) dépasse les ${statsequipeexistante.butsMarques} buts de l'équipe`,
      },
      { status: 400 }
    );
  }

  if (nouveauTotalPasses > statsequipeexistante.butsMarques) {
    return NextResponse.json(
      {
        message: `Le total des passes décisives (${nouveauTotalPasses}) dépasse les ${statsequipeexistante.butsMarques} buts de l'équipe`,
      },
      { status: 400 }
    );
  }

  await prisma.statistiqueJoueur.update({
    where: {
      id: statistiqueid,
    },
    data: {
      buts,
      minutesJouees,
      note,
      passesdecisive,
      poste,
      titulaire,
    },
  });

  return NextResponse.json({
    message: `Les stats pour le joueur ${MembreJoueur.user.name} ont été modifiées`,
  });
}
