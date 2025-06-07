// (server-actions)/CreateEvenement-actions.ts
"use server";

import dayjs from "dayjs";
import "dayjs/locale/fr";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  ConflitDetail,
  Evenement,
  EvenementCreationErrorResponse,
  EvenementCreationResponse,
  EvenementCreationSuccessResponse,
  EvenementDetail,
} from "../types/EvenementsTypes";
import { evenementSchema } from "../schemas/SchemaEvenementv2";

dayjs.locale("fr");

// Type guard pour vérifier si l'événement est récurrent
function isEvenementRecurrent(
  evenement: Evenement
): evenement is EvenementRecurrent {
  return evenement.recurrent === true;
}

// Fonction pour vérifier si un événement existe déjà à la même heure
async function evenementExisteDejaALaMemeHeure(
  equipeId: string,
  dateDebut: Date,
  typeEvenement?: "MATCH" | "ENTRAINEMENT"
): Promise<boolean> {
  const tolerance = 2; // 2 heures de tolérance

  const dateDebutMoins = new Date(dateDebut);
  dateDebutMoins.setHours(dateDebutMoins.getHours() - tolerance);

  const dateDebutPlus = new Date(dateDebut);
  dateDebutPlus.setHours(dateDebutPlus.getHours() + tolerance);

  const where: Prisma.EvenementWhereInput = {
    equipeId,
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
    select: { id: true },
  });

  return evenementsExistants.length > 0;
}

// Créer un événement unique
async function creerEvenementUnique(
  donnees: Evenement,
  equipeId: string
): Promise<EvenementCreationResponse> {
  try {
    // Création de la date de l'événement
    const [heures, minutes] = donnees.heure.split(":").map(Number);

    const dateCourante = dayjs(donnees.date);
    const dateEvenement = dateCourante
      .hour(heures)
      .minute(minutes)
      .second(0)
      .millisecond(0)
      .toDate();

    // Vérification des conflits
    const evenementExiste = await evenementExisteDejaALaMemeHeure(
      equipeId,
      dateEvenement,
      donnees.typeEvenement
    );

    if (evenementExiste) {
      const errorResponse: EvenementCreationErrorResponse = {
        success: false,
        message: `Un ${donnees.typeEvenement === "MATCH" ? "match" : "entraînement"} est déjà programmé autour de cette heure. Veuillez choisir un autre horaire.`,
      };
      return errorResponse;
    }

    // Création de l'événement
    const nouvelEvenement = await prisma.evenement.create({
      data: {
        titre: donnees.titre,
        description: donnees.description || null,
        lieu: donnees.lieu || null,
        typeEvenement: donnees.typeEvenement,
        dateDebut: dateEvenement,
        equipeId,
      },
    });

    // Formater l'événement
    const evenementFormate: EvenementDetail = {
      id: nouvelEvenement.id,
      titre: nouvelEvenement.titre,
      description: nouvelEvenement.description,
      lieu: nouvelEvenement.lieu,
      typeEvenement: nouvelEvenement.typeEvenement,
      dateDebut: nouvelEvenement.dateDebut,
      dateCreation: nouvelEvenement.dateCreation,
      equipeId: nouvelEvenement.equipeId,
      dateDebutFormatee: dayjs(nouvelEvenement.dateDebut).format(
        "dddd D MMMM YYYY à HH:mm"
      ),
    };

    const successResponse: EvenementCreationSuccessResponse = {
      success: true,
      message: "Événement créé avec succès",
      evenement: evenementFormate,
    };

    return successResponse;
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    const errorResponse: EvenementCreationErrorResponse = {
      success: false,
      message: "Erreur lors de la création de l'événement",
    };
    return errorResponse;
  }
}

// Créer des événements récurrents
async function creerEvenementsRecurrents(
  donnees: EvenementRecurrent, // Maintenant typé correctement comme EvenementRecurrent
  equipeId: string
): Promise<EvenementCreationResponse> {
  try {
    // Vérification que la date de fin est après la date de début
    const dateDebut = dayjs(donnees.date).startOf("day");
    const dateFin = dayjs(donnees.dateFin).endOf("day");

    if (dateFin.isBefore(dateDebut)) {
      const errorResponse: EvenementCreationErrorResponse = {
        success: false,
        message: "La date de fin doit être après la date de début",
      };
      return errorResponse;
    }

    const [heures, minutes] = donnees.heure.split(":").map(Number);

    type EvenementCreate = Prisma.EvenementCreateManyInput;

    const evenementsACreer: EvenementCreate[] = [];
    const evenementsConflits: ConflitDetail[] = [];

    let dateCourante = dateDebut;

    // Parcours des dates pour créer les événements
    while (
      dateCourante.isBefore(dateFin) ||
      dateCourante.isSame(dateFin, "day")
    ) {
      const jourSemaine = dateCourante.day();

      if (donnees.jours.includes(jourSemaine)) {
        const dateEvenement = dateCourante
          .hour(heures)
          .minute(minutes)
          .second(0)
          .millisecond(0);

        const evenementExiste = await evenementExisteDejaALaMemeHeure(
          equipeId,
          dateEvenement.toDate(),
          donnees.typeEvenement
        );

        if (evenementExiste) {
          evenementsConflits.push({
            date: dateEvenement.format("YYYY-MM-DD"),
            dateFormatee: dateEvenement.format("dddd D MMMM YYYY"),
          });
        } else {
          evenementsACreer.push({
            titre: donnees.titre,
            description: donnees.description || null,
            lieu: donnees.lieu || null,
            typeEvenement: donnees.typeEvenement,
            dateDebut: dateEvenement.toDate(),
            equipeId,
          });
        }
      }

      dateCourante = dateCourante.add(1, "day");
    }

    if (evenementsACreer.length === 0) {
      if (evenementsConflits.length > 0) {
        const errorResponse: EvenementCreationErrorResponse = {
          success: false,
          message: "Conflits d'horaires pour tous les événements",
          conflits: evenementsConflits,
        };
        return errorResponse;
      }

      const errorResponse: EvenementCreationErrorResponse = {
        success: false,
        message: "Aucun événement à créer avec les critères sélectionnés",
      };
      return errorResponse;
    }

    // Création des événements
    const resultats = await prisma.evenement.createMany({
      data: evenementsACreer,
    });

    // Noms des jours pour l'affichage
    const joursDetails = donnees.jours.map((jour) => {
      const joursDeLaSemaine = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi",
      ];
      return {
        jour,
        nom: joursDeLaSemaine[jour],
      };
    });

    const successResponse: EvenementCreationSuccessResponse = {
      success: true,
      message:
        evenementsConflits.length > 0
          ? `${resultats.count} événements créés avec succès (${evenementsConflits.length} conflits ignorés)`
          : `${resultats.count} événements créés avec succès`,
      nombreEvenements: resultats.count,
      details: {
        debut: dateDebut.format("DD/MM/YYYY"),
        fin: dateFin.format("DD/MM/YYYY"),
        jours: joursDetails,
        heure: donnees.heure,
      },
      conflits: evenementsConflits.length > 0 ? evenementsConflits : undefined,
    };

    return successResponse;
  } catch (error) {
    console.error(
      "Erreur lors de la création des événements récurrents:",
      error
    );
    const errorResponse: EvenementCreationErrorResponse = {
      success: false,
      message: "Erreur lors de la création des événements récurrents",
    };
    return errorResponse;
  }
}

// Server action principale pour créer un événement (unique ou récurrent)
export async function creerEvenement(
  donnees: Evenement,
  equipeId: string
): Promise<EvenementCreationResponse> {
  try {
    // Validation des données avec ZOD
    const resultatValidation = evenementSchema.safeParse(donnees);

    if (!resultatValidation.success) {
      const errorResponse: EvenementCreationErrorResponse = {
        success: false,
        message: "Données invalides",
        details: resultatValidation.error.format(),
      };
      return errorResponse;
    }

    // Vérification de l'authentification
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      const errorResponse: EvenementCreationErrorResponse = {
        success: false,
        message: "Vous devez être connecté",
      };
      return errorResponse;
    }

    // Vérification du rôle d'entraîneur
    const membreEquipe = await prisma.membreEquipe.findFirst({
      where: {
        equipeId,
        userId,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEquipe) {
      const errorResponse: EvenementCreationErrorResponse = {
        success: false,
        message: "Seuls les entraîneurs peuvent créer des événements",
      };
      return errorResponse;
    }

    // Validation réussie, extraction des données
    const donneesValidees = resultatValidation.data;

    // Création des événements selon le type (unique ou récurrent)
    let resultat: EvenementCreationResponse;

    // Utilisation du type guard pour réduire le type
    if (isEvenementRecurrent(donneesValidees)) {
      resultat = await creerEvenementsRecurrents(donneesValidees, equipeId);
    } else {
      resultat = await creerEvenementUnique(donneesValidees, equipeId);
    }

    // Revalidation des chemins si succès
    if (resultat.success) {
      revalidatePath(`/dashboardclient/equipe/${equipeId}`);
    }

    return resultat;
  } catch (error) {
    console.error("Erreur lors de la création de l'événement:", error);
    const errorResponse: EvenementCreationErrorResponse = {
      success: false,
      message: "Erreur lors de la création de l'événement",
    };
    return errorResponse;
  }
}
