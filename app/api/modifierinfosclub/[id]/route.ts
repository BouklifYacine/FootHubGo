import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SchemaModifierInfosClub } from "@/features/club/modifierclub/SchemaModifierInfosClub";

interface RouteParams {
  params: {
    id: string; // L'ID du club à modifier
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id: clubId } = await params;

  const userId = "Lm9B28oAI4ShwdFuVDgGevzPedyHcppb";

  if (!userId) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  // 2. Validation du corps de la requête
  const body = await request.json();
  const validation = SchemaModifierInfosClub.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.errors[0].message },
      { status: 400 } // 400 Bad Request
    );
  }
  const Infosajour = validation.data;

  // 3. Autorisation : L'utilisateur est-il bien l'entraîneur de CE club ?
  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: {
      equipeId: clubId,
      userId: userId,
      role: "ENTRAINEUR",
    },
  });

  if (!membreEquipe) {
    return NextResponse.json(
      { message: "Vous n'etes pas entraineur de cette équipe." },
      { status: 403 }
    );
  }

  // 4. Mise à jour de la base de données
  const updatedClub = await prisma.equipe.update({
    where: { id: clubId },
    data: Infosajour, // On passe directement les données validées
  });

  return NextResponse.json(body);
}
