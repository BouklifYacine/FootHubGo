// app/actions/statistiquesJoueur.ts
'use server'

import { auth } from "@/auth";
import { prisma } from "@/prisma";
// import dayjs from "dayjs"; // Commenté car non utilisé actuellement, à décommenter lors de la réactivation de la condition temporelle
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { StatistiqueJoueurSchema } from "../schemas/SchemasStatistiqueJoueur";

type StatistiqueJoueurInputs = z.infer<typeof StatistiqueJoueurSchema>;

export async function ajouterStatistiqueJoueur(evenementId: string, data: StatistiqueJoueurInputs) {
  try {
    const validation = StatistiqueJoueurSchema.safeParse(data);
    
    if (!validation.success) {
      return {
        success: false,
        message: "Données invalides",
        erreurs: validation.error.format()
      };
    }
  
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
    // Normalement, les statistiques ne peuvent être ajoutées que 2 heures après le début du match
    // À réactiver en production avec le code ci-dessous:
    // 
    // const debutPlus2Heures = dayjs(evenementMatch.dateDebut).add(2, "hour");
    // const maintenant = dayjs();
    // if (maintenant.isBefore(debutPlus2Heures)) {
    //   return {
    //     success: false,
    //     message: "Les statistiques ne peuvent être ajoutées que 2 heures après le début de la rencontre"
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

    const statsExistantes = await prisma.statistiqueJoueur.findUnique({
      where: {
        userId_evenementId: {
          userId: idUtilisateur,
          evenementId: evenementId
        }
      },
    });

    if (statsExistantes) {
      return {
        success: false,
        message: "Vous avez déjà ajouté vos statistiques pour ce match"
      };
    }

    const nouvellesStats = await prisma.statistiqueJoueur.create({
      data: {
        userId: idUtilisateur,
        evenementId: evenementId,
        buts: data.buts,
        passesdécisive: data.passes, 
        minutesJouees: data.minutesJouees,
        note: data.note,
        titulaire: data.titulaire,
        poste: data.poste || "ATTAQUANT"
      },
    });
    
    revalidatePath(`/evenements/${evenementId}`);
    
    return {
      success: true,
      message: "Statistiques ajoutées avec succès",
      statistiques: nouvellesStats
    };
    
  } catch (error) {
    console.error("Erreur lors de l'ajout des statistiques:", error);
    return {
      success: false,
      message: "Erreur lors de l'ajout des statistiques"
    };
  }
}