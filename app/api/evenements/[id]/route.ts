import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

const userId = "Lm9B28oAI4ShwdFuVDgGevzPedyHcppb";

export async function DELETE(request: NextRequest, { params }: Props) {
  const { id } = await params;

  if (!id)
    return NextResponse.json(
      { message: "Id de l'évenement manquant" },
      { status: 400 }
    );

  if (!userId) {
    return NextResponse.json(
      { message: "Vous devez être connecté pour créer un événement." },
      { status: 401 } // 401 Unauthorized est plus approprié ici
    );
  }

    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: { userId: userId },
      select: { role: true, equipeId: true },
    });
  
    if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
      return NextResponse.json(
        {
          message:
            "Vous devez être entraîneur d'une équipe pour créer des événements.",
        },
        { status: 403 }
      );
    }

    const evenementsupprimé = await prisma.evenement.delete({
        where : {id, equipeId : membreEquipe.equipeId}
    })

    return NextResponse.json({message : `l'event ${evenementsupprimé.titre} a bien été supprimé`})
}
