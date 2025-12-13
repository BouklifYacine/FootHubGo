"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/prisma";
import { EventSchema, EventInput } from "../schemas/event.schema";
import dayjs from "dayjs";

export async function createEventAction(data: EventInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

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

  // RBAC: Only Coach can create
  if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
    return {
      success: false,
      message:
        "Vous devez être entraîneur d'une équipe pour créer des événements.",
    };
  }

  const { equipeId } = membreEquipe;

  const validation = EventSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }

  const { titre, typeEvenement, adversaire, lieu, dateDebut } = validation.data;

  try {
    // Basic validation logic
    const existingEvent = await prisma.evenement.findFirst({
      where: {
        equipeId: equipeId,
        dateDebut: dateDebut,
      },
    });

    if (existingEvent) {
      return {
        success: false,
        message:
          "Un événement existe déjà à cette date et heure pour cette équipe.",
      };
    }

    const nouvelEvenement = await prisma.evenement.create({
      data: {
        titre: titre,
        dateDebut: dateDebut,
        typeEvenement: typeEvenement,
        adversaire: typeEvenement === "ENTRAINEMENT" ? null : adversaire,
        lieu: lieu || null,
        equipeId: equipeId,
      },
    });

    return {
      success: true,
      message: "Événement créé avec succès !",
      evenement: nouvelEvenement,
    };
  } catch (error) {
    console.error("Erreur lors de la création de l'événement :", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de l'événement.",
    };
  }
}
