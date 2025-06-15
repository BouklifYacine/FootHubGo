"use server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function quitterClubAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "Vous devez être connecté pour quitter un club.",
    };
  }

  try {
    const membre = await prisma.membreEquipe.findFirst({
      where: { userId },
      include: { equipe: true },
    });

    if (!membre) {
      return {
        success: false,
        message: "Vous n'appartenez à aucun club.",
      };
    }

    if (membre.role === "ENTRAINEUR") {
      const nbEntraineurs = await prisma.membreEquipe.count({
        where: {
          equipeId: membre.equipeId,
          role: "ENTRAINEUR",
        },
      });

      if (nbEntraineurs <= 1) {
        const nbMembres = await prisma.membreEquipe.count({
          where: { equipeId: membre.equipeId },
        });

        if (nbMembres > 1) {
          return {
            success: false,
            message: "Promouvez un autre entraîneur avant de quitter le club.",
          };
        } else {
          await prisma.equipe.delete({
            where: { id: membre.equipeId },
          });
          return {
            success: true,
            message: "Le club a été supprimé car vous étiez le dernier membre.",
          };
        }
      }
    }

    await prisma.membreEquipe.delete({
      where: { id: membre.id },
    });

    return {
      success: true,
      message: "Vous avez quitté le club avec succès.",
    };
  } catch (error) {
    console.error("Erreur lors de la sortie du club:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la sortie du club.",
    };
  }
}
