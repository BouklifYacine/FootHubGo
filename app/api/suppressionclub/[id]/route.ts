import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const userId = "Ll4DUDp3JWKDJvhGorreUad4dXdbzTC9";

  if (!id) {
    return NextResponse.json(
      { message: "L'identifiant du club est manquant." },
      { status: 400 }
    );
  }

  const Entraineur = await prisma.membreEquipe.findFirst({
    where: {
      userId,
      equipeId: id,
      role: "ENTRAINEUR",
    },
  });

  if (!Entraineur) {
    return NextResponse.json(
      { message: "Vous devez etre entraineur pour supprimer le club" },
      { status: 403 }
    );
  }

  const ClubSupprimer = await prisma.equipe.delete({
    where: {
      id,
    },
  });

  return NextResponse.json({
    message: "Le club " + ClubSupprimer.nom + " a bien été supprimer ",
  });
}
