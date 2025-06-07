"use server"

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function supprimerStatistiqueJoueur(evenementId: string) {
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

    const evenementMatch = await prisma.evenement.findUnique({
      where: { 
        id: evenementId, 
        typeEvenement: "MATCH" 
      },
      include: { equipe: true },
    });

    if (!evenementMatch) {
      return {
        success: false,
        message: "L'événement n'existe pas ou c'est un entrainement"
      };
    }

    // NOTE: La condition temporelle est temporairement désactivée pour les tests
    // À réactiver en production avec le code ci-dessous:
    // 
    // const debutPlus2Heures = dayjs(evenementMatch.dateDebut).add(2, "hour");
    // const maintenant = dayjs();
    // if (maintenant.isBefore(debutPlus2Heures)) {
    //   return {
    //     success: false,
    //     message: "Les statistiques ne peuvent être supprimées que 2 heures après le début de la rencontre"
    //   };
    // }

    const joueurEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: evenementMatch.equipeId,
      },
    });

    if (!joueurEquipe) {
      return {
        success: false,
        message: "Vous n'êtes pas membre de cette équipe"
      };
    }

    const joueurPresent = await prisma.presence.findFirst({
      where: {
        userId: idUtilisateur,
        evenementId: evenementId,
        statut: "PRESENT",
      },
    });

    if (!joueurPresent) {
      return {
        success: false,
        message: "Vous n'êtes pas marqué comme présent à ce match"
      };
    }

    const statsExistantes = await prisma.statistiqueJoueur.findFirst({
      where: {
        evenementId: evenementId,
        userId: idUtilisateur,
      },
    });

    if (!statsExistantes) {
      return {
        success: false,
        message: "Aucune statistique n'existe pour vous et ce match"
      };
    }

    // Suppression des statistiques
    await prisma.statistiqueJoueur.delete({
      where: { id: statsExistantes.id },
    });
    
    revalidatePath(`/dashboardclient/evenements/${evenementId}`);
    revalidatePath(`/dashboardclient/evenements/${evenementMatch.equipeId}`);
    
    return {
      success: true,
      message: "Statistiques supprimées avec succès"
    };
    
  } catch (error) {
    console.error("Erreur lors de la suppression des statistiques:", error);
    return {
      success: false,
      message: "Erreur lors de la suppression des statistiques"
    };
  }
} 