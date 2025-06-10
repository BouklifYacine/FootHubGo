import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

const idEntraineur = "Ll4DUDp3JWKDJvhGorreUad4dXdbzTC9";

interface ParametresRoute {
  params: {
    id: string;
  };
}

export async function DELETE(
  request: NextRequest, { params }: ParametresRoute) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { message: "L'identifiant du joueur est manquant." },
      { status: 400 }
    );
  }

  try {
    const membreEntraineur = await prisma.membreEquipe.findFirst({
      where: {
        userId: idEntraineur,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEntraineur) {
      return NextResponse.json(
        { message: "Action non autorisée. Vous devez être entraîneur." },
        { status: 403 }
      );
    }

    const idEquipe = membreEntraineur.equipeId;

    const membreJoueurASupprimer = await prisma.membreEquipe.findFirst({
      where: {
        userId: id,
        equipeId: idEquipe,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!membreJoueurASupprimer) {
      return NextResponse.json(
        {
          message: "Le joueur n'est pas dans cette équipe.",
        },
        { status: 404 }
      );
    }

    if (membreJoueurASupprimer.role !== "JOUEUR") {
      return NextResponse.json(
        { message: "Vous ne pouvez supprimer que des joueurs." },
        { status: 403 }
      );
    }

    await prisma.membreEquipe.delete({
      where: {
        id: membreJoueurASupprimer.id,
      },
    });

    return NextResponse.json({
      message: `Le joueur ${membreJoueurASupprimer.user.name} a bien été retiré de l'équipe.`,
    });
  } catch (erreur) {
    console.error("Erreur lors de la suppression du joueur:", erreur);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
