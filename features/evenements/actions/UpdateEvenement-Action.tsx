"use server";

import dayjs from "dayjs";
import "dayjs/locale/fr";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { updateEvenementSchema, UpdateEvenement } from "@/app/(schema)/SchemaUpdateEvenement";
import { UpdateEvenementResponse, UpdateEvenementSuccessResponse, UpdateEvenementErrorResponse } from "../(types)/UpdateEvenementResponse";

dayjs.locale("fr");

// Fonction pour vérifier si un événement existe déjà à la même heure
async function evenementExisteDejaALaMemeHeure(
  equipeId: string,
  dateDebut: Date,
  evenementId: string,
  typeEvenement?: "MATCH" | "ENTRAINEMENT"
): Promise<boolean> {
  const tolerance = 2; // 2 heures de tolérance

  const dateDebutMoins = new Date(dateDebut);
  dateDebutMoins.setHours(dateDebutMoins.getHours() - tolerance);

  const dateDebutPlus = new Date(dateDebut);
  dateDebutPlus.setHours(dateDebutPlus.getHours() + tolerance);

  const where: Prisma.EvenementWhereInput = {
    equipeId,
    id: { not: evenementId },
    dateDebut: {
      gte: dateDebutMoins,
      lte: dateDebutPlus,
    },
  };

  if (typeEvenement) {
    where.typeEvenement = typeEvenement;
  }

  const evenementsExistants = await prisma.evenement.findMany({
    where,
    select: { id: true, titre: true, dateDebut: true },
  });

  return evenementsExistants.length > 0 ? true : false;
}

export async function updateEvenement(
  donnees: UpdateEvenement,
  equipeId: string,
  evenementId: string
): Promise<UpdateEvenementResponse> {
  try {
    // Validation de session
    const session = await auth();
    if (!session?.user?.id) {
      const errorResponse: UpdateEvenementErrorResponse = {
        success: false,
        message: "Vous devez être connecté pour modifier cet événement",
      };
      return errorResponse;
    }

    // Vérification que l'utilisateur est un entraîneur de l'équipe
    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        equipeId,
        userId: session.user.id,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEquipe) {
      const errorResponse: UpdateEvenementErrorResponse = {
        success: false,
        message: "Vous n'êtes pas autorisé à modifier cet événement",
      };
      return errorResponse;
    }
    
    // Vérification que l'événement existe
    const evenement = await prisma.evenement.findUnique({
      where: {
        id: evenementId,
        equipeId,
      },
      select: { typeEvenement: true, dateDebut: true },
    });

    if (!evenement) {
      const errorResponse: UpdateEvenementErrorResponse = {
        success: false,
        message: "Événement non trouvé",
      };
      return errorResponse;
    }

    // Validation des données
    const parsedData = updateEvenementSchema.safeParse(donnees);

    if (!parsedData.success) {
      const errorResponse: UpdateEvenementErrorResponse = {
        success: false,
        message: "Données invalides",
        details: parsedData.error.format(),
      };
      return errorResponse;
    }

    const updateData: Prisma.EvenementUpdateInput = {};

    if (parsedData.data.titre) updateData.titre = parsedData.data.titre;
    if (parsedData.data.description !== undefined) updateData.description = parsedData.data.description;
    if (parsedData.data.lieu !== undefined) updateData.lieu = parsedData.data.lieu;
    if (parsedData.data.typeEvenement) updateData.typeEvenement = parsedData.data.typeEvenement;

    let nouvelleDate = evenement.dateDebut;

    if (parsedData.data.date || parsedData.data.heure) {
      const dateActuelle = dayjs(evenement.dateDebut);
      let nouvelleDateObj = dateActuelle;

      if (parsedData.data.date) {
        nouvelleDateObj = dayjs(parsedData.data.date)
          .hour(dateActuelle.hour())
          .minute(dateActuelle.minute());
      }

      if (parsedData.data.heure) {
        const [heures, minutes] = parsedData.data.heure.split(":").map(Number);
        nouvelleDateObj = nouvelleDateObj.hour(heures).minute(minutes);
      }

      nouvelleDate = nouvelleDateObj.toDate();

      // Vérification que la date n'est pas dans le passé
      const maintenant = new Date();
      if (nouvelleDate < maintenant) {
        const errorResponse: UpdateEvenementErrorResponse = {
          success: false,
          message: "La date de l'événement ne peut pas être dans le passé",
          error: "Vous ne pouvez pas programmer un événement à une date antérieure à aujourd'hui.",
        };
        return errorResponse;
      }

      const typeEvenement = parsedData.data.typeEvenement || evenement.typeEvenement;
      const evenementExiste = await evenementExisteDejaALaMemeHeure(
        equipeId,
        nouvelleDate,
        evenementId,
        typeEvenement as "MATCH" | "ENTRAINEMENT"
      );

      if (evenementExiste) {
        const errorResponse: UpdateEvenementErrorResponse = {
          success: false,
          message: "Un événement existe déjà à une heure proche",
          error: `Un ${typeEvenement === "MATCH" ? "match" : "entraînement"} est déjà programmé autour de cette heure. Veuillez choisir un autre horaire.`,
        };
        return errorResponse;
      }

      updateData.dateDebut = nouvelleDate;
    }

    // Mise à jour de l'événement
    const evenementMisAJour = await prisma.evenement.update({
      where: { id: evenementId },
      data: updateData,
    });

    // Invalidation du cache
    revalidatePath(`/dashboardclient/equipe/${equipeId}/evenements`);
    
    // Formattage de la réponse
    const evenementFormate = {
      ...evenementMisAJour,
      dateDebutFormatee: dayjs(evenementMisAJour.dateDebut).format(
        "dddd D MMMM YYYY à HH:mm"
      ),
    };

    const successResponse: UpdateEvenementSuccessResponse = {
      success: true,
      message: "Événement mis à jour avec succès",
      evenement: evenementFormate,
    };

    return successResponse;

  } catch (error) {
    console.error("Erreur lors de la modification de l'événement:", error);
    const errorResponse: UpdateEvenementErrorResponse = {
      success: false,
      message: "Erreur lors de la modification de l'événement",
    };
    return errorResponse;
  }
} 