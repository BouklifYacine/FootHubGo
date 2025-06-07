import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();
  const idUtilisateur = session?.user?.id;

  try {
    const equipe = await prisma.equipe.findUnique({
      where: { id },
    });

    if (!equipe) {
      return NextResponse.json(
        { message: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: id,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEquipe) {
      return NextResponse.json(
        {
          message:
            "Seuls les coachs de cette équipe peuvent accéder à cette ressource",
        },
        { status: 403 }
      );
    }

    const codeInvitation = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    if (equipe.codeInvitation === codeInvitation) {
      return NextResponse.json(
        {
          message: `Le code d'invitation existe déja pour l'équipe ${equipe.nom}`,
        },
        { status: 400 }
      );
    } else {
      await prisma.equipe.update({
        where: { id },
        data: { codeInvitation: codeInvitation },
      });

      return NextResponse.json({
        message: `Le code d'invitation pour l'équipe ${equipe.nom} a été créé`,
        codeInvitation: codeInvitation,
      });
    }
  } catch (error) {
    console.error(
      "Erreur serveur lors de la récupération du code d'invitation",
      error
    );
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
