import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;
  if (!userId)
    return NextResponse.json("Vous n'etes pas connecté", { status: 400 });

  // 1. On récupère le lien membre-équipes de l'utilisateur
  const membre = await prisma.membreEquipe.findFirst({
    where: { userId },
    include: { equipe: true },
  });

  if (!membre)
    return NextResponse.json("Vous n'etes pas membre d'un club", { status: 400 });

  // 2. On récupère tous les membres de cette équipe, avec les infos utilisateur
  const membres = await prisma.membreEquipe.findMany({
    where: { equipeId: membre.equipeId },
    include: { user: true }, // pour avoir les infos du user
  });

  // 3. On retourne l'équipe et la liste des membres
  return NextResponse.json({
    equipe: membre.equipe,
    membres,
  });
}