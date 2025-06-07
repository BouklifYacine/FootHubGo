import { StatistiqueEquipeSchema } from "@/app/(schema)/SchemaStatistique";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/auth';

interface RouteParams {
  params: {
    id: string;
    equipeId: string;
  };
}

dayjs.locale("fr");


export async function PATCH(request: NextRequest, { params }: RouteParams) {

  const session = await auth()
  if (!session) {
    return NextResponse.json({ message: "Non Authentifié" }, { status: 401 });
  }
  const idUtilisateur = session.user?.id
  
  const { id, equipeId } = params;
  const body = await request.json();

  const validation = StatistiqueEquipeSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(
      { message: "Erreur dans la validation de vos infos" },
      { status: 400 }
    );

  const evenementMatch = await prisma.evenement.findUnique({
    where: { id: id, typeEvenement: "MATCH" },
    include: { equipe: true },
  });

  if (!evenementMatch)
    return NextResponse.json(
      { message: "L'événement n'existe pas ou c'est un entrainement" },
      { status: 400 }
    );

  const debutPlus2Heures = dayjs(evenementMatch.dateDebut).add(2, "hour");
  const maintenant = dayjs();

  if (maintenant.isBefore(debutPlus2Heures))
    return NextResponse.json(
      {
        message:
          "Les statistiques ne peuvent être modifiées que 2 heures après le début de la rencontre",
      },
      { status: 403 }
    );

  const entraineurEquipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: idUtilisateur,
      equipeId: equipeId,
      role: "ENTRAINEUR",
    },
  });

  if (!entraineurEquipe)
    return NextResponse.json(
      { message: "Vous n'êtes pas entraineur de cette équipe" },
      { status: 403 }
    );

  const entraineurPresent = await prisma.presence.findFirst({
    where: {
      userId: idUtilisateur,
      evenementId: id,
      statut: "PRESENT",
    },
  });

  if (!entraineurPresent) {
    return NextResponse.json(
      { message: "Vous n'êtes pas marqué comme présent à ce match" },
      { status: 403 }
    );
  }

  const statsExistantes = await prisma.statistiqueEquipe.findFirst({
    where: {
      evenementId: id,
      equipeId: equipeId,
    },
  });

  if (!statsExistantes)
    return NextResponse.json(
      { message: "Aucune statistique n'existe pour ce match et cette équipe" },
      { status: 404 }
    );

  try {
    const nouvellesStats = await prisma.statistiqueEquipe.update({
      where: { id: statsExistantes.id },
      data: {
        resultatMatch: body.resultatMatch,
        butsMarques: body.butsMarques,
        butsEncaisses: body.butsEncaisses,
        cleanSheet: body.cleanSheet,
        tirsTotal: body.tirsTotal,
        tirsCadres: body.tirsCadres,
        domicile: body.domicile,
        competition: body.competition,
        adversaire: body.adversaire,
      },
    });

    return NextResponse.json(nouvellesStats, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour des statistiques" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ message: "Non Authentifié" }, { status: 401 });
  }
  const idUtilisateur = session.user?.id
  const { id, equipeId } = params;

  const evenementMatch = await prisma.evenement.findUnique({
    where: { id: id, typeEvenement: "MATCH" },
    include: { equipe: true },
  });

  if (!evenementMatch)
    return NextResponse.json(
      { message: "L'événement n'existe pas ou c'est un entrainement" },
      { status: 400 }
    );

  const debutPlus2Heures = dayjs(evenementMatch.dateDebut).add(2, "hour");
  const maintenant = dayjs();

  if (maintenant.isBefore(debutPlus2Heures))
    return NextResponse.json(
      {
        message:
          "Les statistiques ne peuvent être modifiées que 2 heures après le début de la rencontre",
      },
      { status: 403 }
    );

  const entraineurEquipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: idUtilisateur,
      equipeId: equipeId,
      role: "ENTRAINEUR",
    },
  });

  if (!entraineurEquipe)
    return NextResponse.json(
      { message: "Vous n'êtes pas entraineur de cette équipe" },
      { status: 403 }
    );

  const entraineurPresent = await prisma.presence.findFirst({
    where: {
      userId: idUtilisateur,
      evenementId: id,
      statut: "PRESENT",
    },
  });

  if (!entraineurPresent) {
    return NextResponse.json(
      { message: "Vous n'êtes pas marqué comme présent à ce match" },
      { status: 403 }
    );
  }

  const statsExistantes = await prisma.statistiqueEquipe.findFirst({
    where: {
      evenementId: id,
      equipeId: equipeId,
    },
  });

  if (!statsExistantes)
    return NextResponse.json(
      { message: "Aucune statistique n'existe pour ce match et cette équipe" },
      { status: 404 }
    );

  try {
    await prisma.statistiqueEquipe.delete({
      where: { id: statsExistantes.id },
    });

    return NextResponse.json(
      { message: "Vos stats de matchs on bien été supprimé" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour des statistiques" },
      { status: 500 }
    );
  }
}
