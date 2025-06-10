import { RejoindreEquipeSchema } from "@/features/rejoindreclub/schemaRejoindreEquipe";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const userId = "V8dhvhEdqVzVx0XCgKVXlcP4F8HNjHUx";

  if (!userId) return NextResponse.json("Vous devez etre connecté ");

  const body = await request.json();

  const Validation = RejoindreEquipeSchema.safeParse(body);

  if (!Validation.success) {
    return NextResponse.json(
      { message: Validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { codeInvitation } = Validation.data;

  const equipe = await prisma.equipe.findFirst({
    where: { codeInvitation },
  });

  if (!equipe) {
    return NextResponse.json(
      {
        message: " Code invalide",
      },
      { status: 400 }
    );
  }

  const aunclub = await prisma.membreEquipe.findFirst({
    where: {
      userId,
    },
  });

  if (aunclub) {
    return NextResponse.json({
      message: "Vous êtes déjà membre d'une équipe",
    }, {status : 400});
  }

  await prisma.membreEquipe.create({
    data: {
      equipeId: equipe.id,
      userId,
      role: "JOUEUR",
    },
  });

  return NextResponse.json({
    message: `Vous avez rejoins l'équipe ${equipe.nom}`,
  });
}
