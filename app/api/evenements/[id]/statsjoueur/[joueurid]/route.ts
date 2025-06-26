import { AjouterStatsJoueurSchema } from "@/features/stats/statsjoueur/schema/AjouterStatsJoueurSchema";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string; joueurid: string };
}

const userId = "TcDbe9JkIpVJ4cnSSPZ2PQtNrrod8nPE";

export async function POST(request: NextRequest, { params }: Props) {
  const { id, joueurid } = await params;
  const body = await request.json();

  if (!id || !joueurid)
    return NextResponse.json(
      { message: "Evenement ou joueur inexistant ou incorrect" },
      { status: 400 }
    );

  const validation = AjouterStatsJoueurSchema.safeParse(body);

  if (!validation.success)
    return NextResponse.json(
      { message: validation.error.issues[0].message },
      { status: 400 }
    );

  const { buts, minutesJouees, note, passesdecisive, poste, titulaire } =
    validation.data;

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
          "Vous devez etre entraineur pour ajouter des stats pour un joueur",
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

  const joueurPresent = evenement.presences.find((i) => i.userId === joueurid);

  const MembreJoueur = await prisma.membreEquipe.findFirst({
    where: { userId: joueurid, equipeId: evenement.equipeId },
    select: { role: true, userId: true, user: { select: { name: true } } },
  });

  if (joueurPresent?.statut !== "PRESENT" || MembreJoueur?.role !== "JOUEUR")
    return NextResponse.json(
      {
        message:
          "Ce joueur n'est pas présent sur cet événement et ou n'est pas un joueur",
      },
      { status: 400 }
    );

  const debut = dayjs(evenement?.dateDebut);
  const limiteTempsEvenement = debut.add(3, "hour");
  const maintenant = dayjs();

  // if (maintenant.isBefore(limiteTempsEvenement))
  //   return NextResponse.json(
  //     {
  //       message:
  //         "Vous devez attendre 3 heures après le début de l'événement pour inscrire les statistiques",
  //     },
  //     { status: 400 }
  //   );

  const statsjoueur = await prisma.statistiqueJoueur.findFirst({
    where: { evenementId: id, userId: joueurid },
  });

  if (statsjoueur)
    return NextResponse.json(
      {
        message: "Des stats existent déja pour ce joueur",
      },
      { status: 400 }
    );

  const statsequipeexistante = await prisma.statistiqueEquipe.findUnique({
    where: { evenementId: id },
    select: { butsMarques: true },
  });

  if (!statsequipeexistante)
    return NextResponse.json(
      {
        message: "Vous devez inscrire les stats de l'équipe en premier",
      },
      { status: 400 }
    );

  const statstoutjoueur = await prisma.statistiqueJoueur.findMany({
    where: { evenementId: id },
    select: { buts: true, passesdecisive: true },
  });

  const totalButsJoueurs = statstoutjoueur
    .map((j) => j.buts)
    .reduce((acc, b) => acc + b, 0);
  const totalPasseDecisivesJoueurs = statstoutjoueur
    .map((j) => j.passesdecisive)
    .reduce((acc, b) => acc + b, 0);

  if (
    totalButsJoueurs + buts > statsequipeexistante.butsMarques ||
    totalPasseDecisivesJoueurs + passesdecisive >
      statsequipeexistante.butsMarques
  )
    return NextResponse.json({
      message : " Vos joueurs ont inscrit plus de buts ou passe décisives qu'il n'y en a eu dans le match"
    }, {status : 400});

  await prisma.statistiqueJoueur.create({
    data: {
      buts,
      minutesJouees,
      note,
      passesdecisive,
      poste,
      titulaire,
      userId: joueurid,
      evenementId: id,
    },
  });

  return NextResponse.json({
    message: `Les stats pour le joueur ${MembreJoueur.user.name} ont été ajoutés`,
  });
}
