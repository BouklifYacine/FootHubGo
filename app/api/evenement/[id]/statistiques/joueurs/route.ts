import { StatistiqueJoueurSchema } from "@/app/(schema)/SchemaStatistique";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

dayjs.locale("fr");
const session = await auth()
const idUtilisateur = session?.user?.id


export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const evenementMatch = await prisma.evenement.findUnique({
    where: { id: id, typeEvenement: "MATCH" },
    include: { equipe: true },
  });

  if (!evenementMatch)
    return NextResponse.json(
      { message: "L'événement n'existe pas ou c'est un entrainement" },
      { status: 400 }
    );

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: idUtilisateur,
      equipeId: evenementMatch.equipeId,
    },
  });

  if (!membreEquipe)
    return NextResponse.json(
      { message: "Vous ne faites pas partie de cette équipe" },
      { status: 403 }
    );

  const statsExistantes = await prisma.statistiqueJoueur.findFirst({
    where: {
      evenementId: id,
    },
  });

  if (!statsExistantes)
    return NextResponse.json(
      { message: "Aucune données disponible pour ce match " },
      { status: 400 }
    );

  return NextResponse.json(statsExistantes);
}


export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

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
          "Les statistique ne peuvent etre ajouté que 2 heures après le début de la rencontre",
      },
      { status: 403 }
    );

  const joueurequipe = await prisma.membreEquipe.findFirst({
    where: {
      userId: idUtilisateur,
      equipeId: evenementMatch.equipeId,
    },
  });

  if (!joueurequipe)
    return NextResponse.json(
      { message: "Vous n'etes pas membre de cette équipe" },
      { status: 403 }
    );

    const joueurPresent = await prisma.presence.findFirst({
        where: {
          userId: idUtilisateur,
          evenementId: id,
          statut: "PRESENT"
        }
      });

      if (!joueurPresent) {
        return NextResponse.json(
          { message: "Vous n'êtes pas marqué comme présent à ce match" },
          { status: 403 }
        );
      }

  const statsExistantes = await prisma.statistiqueJoueur.findUnique({
    where: {
      userId_evenementId: {
        userId: idUtilisateur || "",
        evenementId: id,
      },
    },
  });

  if (statsExistantes)
    return NextResponse.json(
      { message: "Des stats existent déja pour ce match " },
      { status: 400 }
    );

    try {
        const nouvellesStats = await prisma.statistiqueJoueur.create({
          data: {
            userId: idUtilisateur || "",
            evenementId: id,
            buts: body.buts,
            passesdécisive: body.passesdécisive,
            note: body.note,
            titulaire: body.titulaire,
            poste: body.poste
          }
        });
    
        return NextResponse.json(nouvellesStats, { status: 201 });
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des statistiques:", error);
        return NextResponse.json(
          { message: "Erreur lors de l'enregistrement des statistiques" },
          { status: 500 }
        );
      }
}
