"use server"
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function SupprimerEvenementAction(id: string) {
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

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: { userId: userId },
    select: { role: true, equipeId: true },
  });

  if (!membreEquipe || membreEquipe.role !== "ENTRAINEUR") {
    return {
      success: false,
      message:
        "Vous devez être entraîneur de l'équipe pour supprimer des événements.",
    };
  }

  const evenementsupprimé = await prisma.evenement.delete({
    where: { id, equipeId: membreEquipe.equipeId },
  });

  return {
    success: true,
    message: `l'evenement ${evenementsupprimé.titre} a bien été supprimé`,
  };
}
