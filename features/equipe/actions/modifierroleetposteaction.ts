"use server"

import { z } from "zod";
import { ChangementDonneeJoueur } from "../schemas/SchemaEquipe";
import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";

export async function modifierRoleEtPoste(
  equipeId: string, 
  membreId: string, 
  data: z.infer<typeof ChangementDonneeJoueur>
) {
  try {
 
    const validation = ChangementDonneeJoueur.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        message: "Données invalides",
        erreurs: validation.error.format()
      };
    }

    const session = await auth();
    const idUtilisateur = session?.user?.id;

    if (!idUtilisateur) {
      return {
        success: false,
        message: "Vous devez être connecté"
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
        message: "Seuls les coachs de cette équipe peuvent modifier les rôles"
      };
    }

    const dataToUpdate: { 
      role: 'ENTRAINEUR' | 'JOUEUR', 
      posteJoueur?: 'GARDIEN' | 'DEFENSEUR' | 'MILIEU' | 'ATTAQUANT' | null 
    } = {
      role: data.role,
      posteJoueur: data.role === 'ENTRAINEUR' ? null : data.posteJoueur
    };

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: membreId },
        data: {
          roleEquipe: data.role,
        },
      });

      return await tx.membreEquipe.update({
        where: { userId: membreId },
        data: dataToUpdate,
      });
    });

    revalidatePath(`/dashboardclient/equipe/${equipeId}`);

    return {
      success: true,
      message: `Le rôle a été mis à jour avec succès`,
      role: result.role,
      poste: result.posteJoueur
    };

  } catch (error) {
    console.error("Erreur lors de la modification du rôle:", error);
    return {
      success: false,
      message: "Erreur lors de la modification du rôle"
    };
  }
}