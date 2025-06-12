
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const userId = "Lm9B28oAI4ShwdFuVDgGevzPedyHcppb";

    if (!userId) {
      return NextResponse.json(
        { message: "Accès non autorisé. Vous devez être connecté." },
        { status: 401 }
      );
    }

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        equipeId: id,
        userId,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEquipe) {
      return NextResponse.json(
        {
          message: "Action non autorisée. Seul l'entraîneur peut agir.",
          membreEquipe,
        },
        { status: 403 }
      );
    }

    const nouveauCode = Math.floor(100000 + Math.random() * 900000).toString();
 

    const equipeMiseAJour = await prisma.equipe.update({
      where: { id: id },
      data: { codeInvitation : nouveauCode },
    });

    return NextResponse.json({
      message: `Le code d'invitation pour l'équipe ${equipeMiseAJour.nom} a été mis à jour.`,
      codeInvitation: nouveauCode,
    });
  } catch (error) {
    console.error(
      "Erreur serveur lors de la mise à jour du code d'invitation:",
      error
    );
    return NextResponse.json(
      { message: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const userId = "Ll4DUDp3JWKDJvhGorreUad4dXdbzTC9";

  if (!userId) {
    return NextResponse.json(
      { message: "Accès non autorisé. Vous devez être connecté." },
      { status: 401 }
    );
  }

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: {
      equipeId: id,
      userId,
      role: "ENTRAINEUR",
    },
  });

  if (!membreEquipe) {
    return NextResponse.json(
      {
        message: "Action non autorisée. Seul l'entraîneur peut agir.",
        membreEquipe,
      },
      { status: 403 }
    );
  }

  const equipeMiseAJour = await prisma.equipe.update({
    where: { id: id },
    data: { codeInvitation: null }, 
  });

  return NextResponse.json({
    message: `Le code d'invitation pour l'équipe ${equipeMiseAJour.nom} a été supprimé.`,
  });
}
