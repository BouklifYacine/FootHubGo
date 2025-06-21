"use server"

import { auth } from "@/auth";
import { CreationPresenceSchema } from "@/features/presences/schemas/presenceschemas";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { z } from "zod";

type schema = z.infer<typeof CreationPresenceSchema>;

export async function PresenceEvenementJoueurAction(id: string, data: schema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!id)
    return {
      success: false,
      message: "Id de l'évenement manquant",
    };

  if (!userId) {
    return {
      success: false,
      message: "Vous devez être connecté pour créer un événement.",
    };
  }

  const validation = CreationPresenceSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }
  const { statut } = validation.data;

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  if (!membreEquipe || membreEquipe.role !== "JOUEUR") {
    return {
      success: false,
      message:
        "Vous devez être joueur d'une équipe pour indiquer votre présence a un évenement.",
    };
  }

  const presenceEnregistree = await prisma.presence.upsert({
    where: {
      userId_evenementId: {
        userId: userId,
        evenementId: id,
      },
    },
    update: {
      statut: statut,
    },
    create: {
      userId: userId,
      evenementId: id,
      statut: statut,
      dateCreation: new Date(),
    },
  });

  return {
    success: true,
    message: "Votre présence a été enregistrée avec succès.",
    presence: presenceEnregistree,
  };
}
