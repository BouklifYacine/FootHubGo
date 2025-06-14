"use server"
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function SupprimerJoueurClubAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!id) {
    return {
      success: false,
      message: "L'identifiant du joueur est manquant.",
    };
  }

  try {
    const membreEntraineur = await prisma.membreEquipe.findFirst({
      where: {
        userId,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEntraineur) {
      return {
        success: false,
        message: "Action non autorisée. Vous devez être entraîneur.",
      };
    }

    const idEquipe = membreEntraineur.equipeId;

    const membre = await prisma.membreEquipe.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });

    if (!membre) {
      return {
        success: false,
        message: "Le joueur n'est pas dans cette équipe.",
      };
    }

    if (membre.role !== "JOUEUR") {
      return {
        success: false,
        message: "Vous ne pouvez supprimer que des joueurs.",
      };
    }

    await prisma.membreEquipe.delete({
      where: {
        id: membre.id,
      },
    });
    return {
      success: true,
      message: `Le joueur ${membre.user.name} a bien été retiré de l'équipe.`,
    };
  } catch (erreur) {
    console.error("Erreur lors de la suppression du joueur:", erreur);
  }
}
