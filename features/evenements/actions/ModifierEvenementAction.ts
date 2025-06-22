"use server";
import { auth } from "@/auth";
import { ModifierEvenementSchema } from "@/features/evenements/schemas/ModificationEvenementsSchema";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import z from "zod";

type schema = z.infer<typeof ModifierEvenementSchema>;

export async function ModifierEvenementAction(id: string, data: schema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  const validation = ModifierEvenementSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }
  const DataaJour = validation.data;

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

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
    return {
      success: false,
      message:
        "Vous devez être entraîneur d'une équipe pour créer des événements.",
    };
  }

  const Evenementexistant = await prisma.evenement.findUnique({
    where: { id },
  });
  if (!Evenementexistant) {
    return {
      success: false,
      message: "Événement introuvable.",
    };
  }
  if (Evenementexistant.equipeId !== membreEquipe.equipeId) {
    return {
      success: false,
      message: "Vous ne pouvez pas modifier un événement d'une autre équipe.",
    };
  }

  const Evenementajour = await prisma.evenement.update({
    where: { id },
    data: DataaJour,
  });

  return {
    success: true,
    message: "Événement mis à jour.",
    evenement: Evenementajour,
  };
}
