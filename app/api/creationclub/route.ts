import { auth } from "@/auth";
import { SchemaCreationClub } from "@/features/creationclub/schemas/SchemaCreationClub";
import { hashElement } from "@/lib/argon2";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });
//   const userId = session?.user.id;
    const userId = "Ll4DUDp3JWKDJvhGorreUad4dXdbzTC9";

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeInvitation = await hashElement(resetCode);

  if (!userId) {
    return NextResponse.json(
      { message: "Vous devez être connecté pour créer un club" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const validation = SchemaCreationClub.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { nom, description, NiveauClub } = validation.data;

  // A changer pour la version premium plus tard et permettre max 3 clubs avec mode payant
  const MembreEquipeExistant = await prisma.membreEquipe.findFirst({
    where: { userId },
  });

  if (MembreEquipeExistant) {
    return NextResponse.json(
      { message: "Vous êtes déjà membre d'un club" },
      { status: 403 }
    );
  }

  // A changer pour la version premium plus tard et permettre d'etre entraineur de plusieurs clubs max 3
  const EstCoach = await prisma.membreEquipe.findFirst({
    where: {
      userId,
      role: "ENTRAINEUR",
    },
  });

  if (EstCoach) {
    return NextResponse.json(
      { message: "Vous êtes déjà entraîneur d'un autre club" },
      { status: 403 }
    );
  }

  const ClubExistant = await prisma.equipe.findFirst({
    where: {
      nom: {
        equals: nom,
        mode: "insensitive", // Insensible à la casse
      },
    },
  });

  if (ClubExistant) {
    return NextResponse.json(
      { message: "Un club avec ce nom existe déjà" },
      { status: 409 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const NouveauClub = await tx.equipe.create({
        data: {
          nom,
          description,
          niveau: NiveauClub,
          dateCreation: new Date(),
          codeInvitation,
        },
      });

      await tx.membreEquipe.create({
        data: {
          role: "ENTRAINEUR",
          userId: userId,
          equipeId: NouveauClub.id,
          joinedAt: new Date(),
        },
      });

      return NouveauClub;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du club:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du club" },
      { status: 500 }
    );
  }
}
