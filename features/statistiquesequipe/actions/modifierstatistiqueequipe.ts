import { prisma } from "@/prisma";
import { StatistiqueEquipeSchema } from "../schemas/SchemaStatistique";
import { Competition, ResultatMatch } from "../types/statistiquesequipetypes";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { headers } from "next/headers";

export async function modifierStatistiqueEquipe(evenementId: string, equipeId: string, data: StatistiqueEquipeInputs) {
  try {
    const validation = StatistiqueEquipeSchema.safeParse(data);
    
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

    // Vérifier que l'événement existe et est de type match
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
    //     message: "Les statistiques ne peuvent être modifiées que 2 heures après le début de la rencontre"
    //   };
    // }

    // Vérifier que l'utilisateur est un entraîneur de l'équipe
    const entraineurEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: equipeId,
        role: "ENTRAINEUR",
      },
    });

    if (!entraineurEquipe) {
      return {
        success: false,
        message: "Vous n'êtes pas entraineur de cette équipe"
      };
    }

    const entraineurPresent = await prisma.presence.findFirst({
      where: {
        userId: idUtilisateur,
        evenementId: evenementId,
        statut: "PRESENT",
      },
    });

    if (!entraineurPresent) {
      return {
        success: false,
        message: "Vous n'êtes pas marqué comme présent à ce match"
      };
    }

    const statsExistantes = await prisma.statistiqueEquipe.findFirst({
      where: {
        evenementId: evenementId,
        equipeId: equipeId,
      },
    });

    if (!statsExistantes) {
      return {
        success: false,
        message: "Aucune statistique n'existe pour ce match et cette équipe"
      };
    }

    // Mise à jour des statistiques avec gestion des valeurs par défaut pour les champs optionnels
    const statsModifiees = await prisma.statistiqueEquipe.update({
      where: { id: statsExistantes.id },
      data: {
        resultatMatch: data.resultatMatch as ResultatMatch || statsExistantes.resultatMatch,
        butsMarques: data.butsMarques,
        butsEncaisses: data.butsEncaisses,
        cleanSheet: data.cleanSheet,
        tirsTotal: data.tirsTotal,
        tirsCadres: data.tirsCadres,
        domicile: data.domicile,
        competition: data.competition as Competition || statsExistantes.competition,
        adversaire: data.adversaire || statsExistantes.adversaire,
      },
    });
    
    revalidatePath(`/dashboardclient/evenements/${evenementId}`);
    revalidatePath(`/dashboardclient/evenements/${equipeId}`);
    
    return {
      success: true,
      message: "Statistiques modifiées avec succès",
      statistiques: statsModifiees
    };
    
  } catch (error) {
    console.error("Erreur lors de la modification des statistiques:", error);
    return {
      success: false,
      message: "Erreur lors de la modification des statistiques"
    };
  }
}