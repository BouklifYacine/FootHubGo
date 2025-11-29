"use server";
import { auth } from "@/auth";
import { notifyUser } from "@/features/notifications/notifyUser";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function quitterClubAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;
  const userName = session?.user.name;
  const userImage = session?.user.image;

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

    if (membre.role === "JOUEUR") {
      const entraineurs = await prisma.membreEquipe.findMany({
        where: {
          equipeId: membre.equipeId, 
          role: "ENTRAINEUR",        
        },
      });

      for (const entraineur of entraineurs) {
        if (entraineur.userId === userId) continue; 

        await notifyUser({
          userId: entraineur.userId,
          type: "QUITTER_CLUB",
          title: "Membre a quitté",
          message: `${userName} a quitté ${membre.equipe.nom}`,
          fromUserName: userName!,
           fromUserImage: userImage || "",
        });
      }
    }

    if (membre.role === "ENTRAINEUR") {
      const tousLesMembres = await prisma.membreEquipe.findMany({
        where: {
          equipeId: membre.equipeId, 
        },
      });

      for (const m of tousLesMembres) {
        if (m.userId === userId) continue;

        await notifyUser({
          userId: m.userId,
          type: "QUITTER_CLUB",
          title: "Entraîneur a quitté",
          message: `${userName} (entraîneur) a quitté ${membre.equipe.nom}`,
          fromUserName: userName!,
          fromUserImage: userImage || "",
        });
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
