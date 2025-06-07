import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { prisma } from "@/prisma";
import { auth } from "@/auth";

dayjs.locale("fr");

const session = await auth()

const idUtilisateur = session?.user?.id

export async function GET(
  req: NextRequest,
  { params }: { params: { idEquipe: string; idevenement: string } }
) {
  try {
    const { idEquipe, idevenement } = await params;

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        equipeId: idEquipe,
        userId: idUtilisateur,
        role: { in: ["ENTRAINEUR", "JOUEUR"] },
      },
    });

    if (!membreEquipe) {
      return NextResponse.json(
        { error: "Vous n'êtes pas membre de cette équipe" },
        { status: 403 }
      );
    }

    const evenement = await prisma.evenement.findUnique({
      where: {
        id: idevenement,
        equipeId: idEquipe,
      },
      include: {
        presences: {
          where: { userId: idUtilisateur },
          select: { id: true, statut: true },
        },
      },
    });

    if (!evenement) {
      return NextResponse.json(
        { error: "Événement non trouvé" },
        { status: 404 }
      );
    }

    const evenementFormate = {
      ...evenement,
      dateDebutFormatee: dayjs(evenement.dateDebut).format(
        "dddd D MMMM YYYY à HH:mm"
      ),
      maPresence: evenement.presences[0] || null,
    };

    return NextResponse.json(evenementFormate);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'événement" },
      { status: 500 }
    );
  }
}



