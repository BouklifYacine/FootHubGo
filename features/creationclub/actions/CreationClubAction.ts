"use server"

import { auth } from "@/auth";
import { SchemaCreationClub } from "@/features/creationclub/schemas/SchemaCreationClub";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import z from "zod";

type schema = z.infer<typeof SchemaCreationClub>;

export async function CreationClubAction(data: schema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  if (!userId) {
    return {
      success: false,
      message: "Vous devez être connecté pour créer un club",
    };
  }

  const validation = SchemaCreationClub.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }

  const { nom, description, NiveauClub, statut } = validation.data;

  // A changer pour la version premium plus tard et permettre max 3 clubs avec mode payant
  const MembreEquipeExistant = await prisma.membreEquipe.findFirst({
    where: { userId },
  });

  if (MembreEquipeExistant) {
    return {
      success: false,
      message: "Vous etes déja membre d'un club",
    };
  }

  // A changer pour la version premium plus tard et permettre d'etre entraineur de plusieurs clubs max 3
  const EstCoach = await prisma.membreEquipe.findFirst({
    where: {
      userId,
      role: "ENTRAINEUR",
    },
  });

  if (EstCoach) {
    return {
      success: false,
      message: "Vous êtes déjà entraîneur d'un autre club",
    };
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
    return {
      success: false,
      message: "Un club avec ce nom existe déja",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const NouveauClub = await tx.equipe.create({
        data: {
          nom,
          description,
          niveau: NiveauClub,
          dateCreation: new Date(),
          codeInvitation: resetCode,
          statut : statut
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

    return {
      success: true,
      message: `Bravo vous avez créer le club ${result.nom}`,
    };
  } catch (error) {
    console.error("Erreur lors de la création du club:", error);
  }
}
