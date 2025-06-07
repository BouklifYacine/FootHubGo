import { StatistiqueJoueurSchema } from "@/app/(schema)/SchemaStatistique";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
    joueurId: string;
  };
}

dayjs.locale("fr");


export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Non Authentifié" }, { status: 401 })}

    const idUtilisateur = session.user?.id;

  const { id, joueurId } = await params;
  const body = await request.json();

  if (joueurId !== idUtilisateur) {
    return NextResponse.json(
      { message: "Vous ne pouvez modifier que vos propres statistiques" },
      { status: 403 }
    );
  }

  const validation = StatistiqueJoueurSchema.safeParse(body);

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

  const joueurEquipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: idUtilisateur,
      equipeId: evenementMatch.equipeId,
    },
  });

  if (!joueurEquipe)
    return NextResponse.json(
      { message: "Vous n'êtes pas membre de cette équipe" },
      { status: 403 }
    );

  const joueurPresent = await prisma.presence.findFirst({
    where: {
      userId: idUtilisateur,
      evenementId: id,
      statut: "PRESENT",
    },
  });

  if (!joueurPresent) {
    return NextResponse.json(
      { message: "Vous n'êtes pas marqué comme présent à ce match" },
      { status: 403 }
    );
  }

  const statsExistantes = await prisma.statistiqueJoueur.findFirst({
    where: {
      evenementId: id,
      userId: idUtilisateur,
    },
  });

  if (!statsExistantes)
    return NextResponse.json(
      { message: "Aucune statistique n'existe pour vous et ce match" },
      { status: 404 }
    );

  try {
    const nouvellesStats = await prisma.statistiqueJoueur.update({
      where: { id: statsExistantes.id },
      data: {
        buts: body.buts,
        passesdécisive: body.passesdécisive,
        note: body.note,
        titulaire: body.titulaire,
        poste: body.poste,
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
  const { id, joueurId } = await params;

  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Non Authentifié" }, { status: 401 })}

    const idUtilisateur = session.user?.id;

  if (joueurId !== idUtilisateur) {
    return NextResponse.json(
      { message: "Vous ne pouvez modifier que vos propres statistiques" },
      { status: 403 }
    );
  }

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

  const joueurEquipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: idUtilisateur,
      equipeId: evenementMatch.equipeId,
    },
  });

  if (!joueurEquipe)
    return NextResponse.json(
      { message: "Vous n'êtes pas membre de cette équipe" },
      { status: 403 }
    );

  const joueurPresent = await prisma.presence.findFirst({
    where: {
      userId: idUtilisateur,
      evenementId: id,
      statut: "PRESENT",
    },
  });

  if (!joueurPresent) {
    return NextResponse.json(
      { message: "Vous n'êtes pas marqué comme présent à ce match" },
      { status: 403 }
    );
  }

  const statsExistantes = await prisma.statistiqueJoueur.findFirst({
    where: {
      evenementId: id,
      userId: idUtilisateur,
    },
  });

  if (!statsExistantes)
    return NextResponse.json(
      { message: "Aucune statistique n'existe pour vous et ce match" },
      { status: 404 }
    );

  try {
    await prisma.statistiqueJoueur.delete({
      where: { id: statsExistantes.id },
    });

    return NextResponse.json({message : "Votre stats a bien été supprimé"}, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques:", error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour des statistiques" },
      { status: 500 }
    );
  }
}
