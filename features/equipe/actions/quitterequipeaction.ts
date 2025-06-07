import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function quitterEquipe(equipeId: string, membreId?: string) {
  try {
  const session = await auth.api.getSession({
     headers: await headers() 
 });
    const idUtilisateurConnecte = session?.user?.id;

    if (!idUtilisateurConnecte) {
      return {
        success: false,
        message: "Vous devez être connecté"
      };
    }

    const idMembreASupprimer = membreId || idUtilisateurConnecte;
    
    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
    });

    if (!equipe) {
      return {
        success: false,
        message: "Équipe non trouvée"
      };
    }

    if (idUtilisateurConnecte !== idMembreASupprimer) {
      const membreConnecte = await prisma.membreEquipe.findFirst({
        where: {
          userId: idUtilisateurConnecte,
          equipeId: equipeId,
          role: "ENTRAINEUR",
        },
      });

      if (!membreConnecte) {
        return {
          success: false,
          message: "Vous n'avez pas les droits pour effectuer cette action"
        };
      }
    }

    const membreASupprimer = await prisma.membreEquipe.findFirst({
      where: {
        userId: idMembreASupprimer,
        equipeId: equipeId,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    if (!membreASupprimer) {
      return {
        success: false,
        message: "L'utilisateur n'est pas membre de cette équipe"
      };
    }

    if (membreASupprimer.role === "ENTRAINEUR") {
      const nombreCoachs = await prisma.membreEquipe.count({
        where: {
          equipeId: equipeId,
          role: "ENTRAINEUR",
        },
      });

      if (nombreCoachs === 1) {
        return {
          success: false,
          message: "Vous êtes le dernier coach de l'équipe. Veuillez supprimer l'équipe plutôt que de la quitter."
        };
      }
    }

    const nomUtilisateur = membreASupprimer.user?.name || "L'utilisateur";

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: idMembreASupprimer },
        data: {
          roleEquipe: "SANSCLUB",
          AunClub: "NON",
        },
      });

      await tx.statistiqueJoueur.deleteMany({
        where: {
          userId: idMembreASupprimer,
          evenement: {
            equipeId: equipeId,
          },
        },
      });

      await tx.presence.deleteMany({
        where: {
          userId: idMembreASupprimer,
          evenement: {
            equipeId: equipeId,
          },
        },
      });

      await tx.membreEquipe.delete({
        where: {
          id: membreASupprimer.id,
        },
      });
    });

    revalidatePath(`/dashboardclient/equipe/${equipeId}`);
    revalidatePath(`/dashboardclient`);

    return {
      success: true,
      message: `${nomUtilisateur} a quitté l'équipe ${equipe.nom} avec succès`
    };
  } catch (error) {
    console.error("Erreur serveur lors de la suppression du membre", error);
    return {
      success: false,
      message: "Erreur serveur lors de la suppression du membre"
    };
  }
}