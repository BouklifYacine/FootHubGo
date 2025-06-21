"use server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { CreationEvenementSchema } from "../schemas/CreationEvenementsSchema";
import dayjs from "dayjs";
import { prisma } from "@/prisma";
import { z } from "zod";

type schema = z.infer<typeof CreationEvenementSchema>;

export async function CreerEvenementAction(data: schema) {
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

  const validation = CreationEvenementSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }

  const { titre, typeEvenement, adversaire, lieu, dateDebut } = validation.data;

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

  const { equipeId } = membreEquipe;

  try {
    const nowUtc = dayjs();
    const eventDateUtc = dayjs(dateDebut);

    if (eventDateUtc.isBefore(nowUtc)) {
      return {
        success: false,
        message:
          "La date de début de l'événement ne peut pas être antérieure à la date et heure actuelles.",
      };
    }

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
        adversaire: adversaire,
        lieu: lieu,
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
  }
}
