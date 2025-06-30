import { auth } from "@/auth";
import { AjouterStatsEquipeSchema } from "@/features/stats/statsequipe/schema/AjouterStatsEquipeSchema";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Props) {
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

  const { id } = await params;
  const body = await request.json();

  if (!id)
    return NextResponse.json(
      { message: "Evenement inexistant ou incorrect" },
      { status: 400 }
    );

  const validation = AjouterStatsEquipeSchema.safeParse(body);

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

  const debut = dayjs(evenement?.dateDebut);
  const limiteTempsEvenement = debut.add(3, "hour");
  const maintenant = dayjs();

  if (maintenant.isBefore(limiteTempsEvenement))
    return NextResponse.json(
      {
        message:
          "Vous devez attendre 3 heures après le début de l'événement pour inscrire les statistiques",
      },
      { status: 400 }
    );

  const StatsEquipe = await prisma.statistiqueEquipe.findUnique({
    where: { evenementId: id },
    select: { resultatMatch: true },
  });

  if (StatsEquipe?.resultatMatch)
    return NextResponse.json(
      {
        message: "Des stats existent déja pour ce match",
      },
      { status: 400 }
    );

  await prisma.statistiqueEquipe.create({
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
    message: `Les stats pour l'évenement ${evenement.titre} ont été ajoutés`,
  });
}
