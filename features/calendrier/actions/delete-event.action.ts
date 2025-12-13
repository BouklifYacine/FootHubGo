"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/prisma";

export async function deleteEventAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "Vous devez être connecté pour supprimer un événement.",
    };
  }

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  // RBAC: Only Coach can delete
  if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
    return {
      success: false,
      message: "Seul l'entraîneur peut supprimer des événements.",
    };
  }

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
        message: "Vous ne pouvez pas supprimer cet événement.",
      };
    }

    await prisma.evenement.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Événement supprimé avec succès.",
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement :", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression.",
    };
  }
}
