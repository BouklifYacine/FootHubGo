import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function supprimerMembreEquipe(
  equipeId: string, 
  membreId: string
) {
  try {
 const session = await auth.api.getSession({
    headers: await headers() 
});
    const idUtilisateur = session?.user?.id;

    if (!idUtilisateur) {
      return {
        success: false,
        message: "Vous devez être connecté"
      };
    }

    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
    });

    if (!equipe) {
      return {
        success: false,
        message: "Équipe non trouvée"
      };
    }

    const joueurauclub = await prisma.membreEquipe.findUnique({
      where: { userId: membreId },
      include: { user: { select: { name: true } } },
    });

    if (!joueurauclub) {
      return {
        success: false,
        message: "Ce joueur ne fait pas partie de ce club"
      };
    }

    const coachEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: equipeId,
        role: "ENTRAINEUR",
      },
    });

    if (!coachEquipe) {
      return {
        success: false,
        message: "Seuls les coachs de cette équipe peuvent supprimer les membres du club"
      };
    }
  
    const nomJoueur = joueurauclub.user.name;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: membreId },
        data: {
          roleEquipe: "SANSCLUB",
          AunClub: "NON",
        },
      });

      await tx.membreEquipe.delete({
        where: { id: joueurauclub.id },
      });
    });

    revalidatePath(`/dashboardclient/equipe/${equipeId}`);

    return {
      success: true,
      message: `Le joueur ${nomJoueur} a bien été retiré du club`
    };

  } catch (error) {
    console.error(
      "Erreur serveur lors de la suppression du membre",
      error
    );
    return {
      success: false,
      message: "Erreur serveur lors de la suppression du membre"
    };
  }
}