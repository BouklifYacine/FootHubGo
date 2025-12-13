"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/prisma";
import { EventSchema, EventInput } from "../schemas/event.schema";

export async function updateEventAction(id: string, data: EventInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "Vous devez être connecté pour modifier un événement.",
    };
  }

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  // RBAC: Only Coach can update
  if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
    return {
      success: false,
      message: "Seul l'entraîneur peut modifier des événements.",
    };
  }

  const validation = EventSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }

  const { titre, typeEvenement, adversaire, lieu, dateDebut } = validation.data;

  try {
    const existingEvent = await prisma.evenement.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return {
        success: false,
        message: "Événement introuvable.",
      };
    }

    if (existingEvent.equipeId !== membreEquipe.equipeId) {
      return {
        success: false,
        message: "Vous ne pouvez pas modifier cet événement.",
      };
    }

    const updatedEvent = await prisma.evenement.update({
      where: { id },
      data: {
        titre,
        dateDebut,
        typeEvenement,
        adversaire: typeEvenement === "ENTRAINEMENT" ? null : adversaire,
        lieu: lieu || null,
      },
    });

    return {
      success: true,
      message: "Événement modifié avec succès !",
      evenement: updatedEvent,
    };
  } catch (error) {
    console.error("Erreur lors de la modification de l'événement :", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la modification.",
    };
  }
}
