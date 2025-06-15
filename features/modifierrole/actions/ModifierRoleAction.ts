"use server"

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { z } from "zod";
import { ModifierRoleSchema } from "../schema/ModifierRoleSchema";

type schema = z.infer<typeof ModifierRoleSchema>;

export async function ModifierRoleAction(id: string, data: schema) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const userId = session?.user.id;

    if (!userId) {
      return {
        success: false,
        message: "Accès non autorisé. Vous devez être connecté.",
      };
    }

    const validation = ModifierRoleSchema.safeParse(data);

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors[0].message,
      };
    }

    const { role } = validation.data;

    // Empêcher une requête vide qui ne ferait rien
    if (!role) {
      return {
        success: false,
        message:
          "Vous devez fournir au moins un champ à modifier (rôle ou poste).",
      };
    }

    // 2. VÉRIFIER LES AUTORISATIONS
    // L'utilisateur qui fait la requête est-il bien un entraîneur ?
    const membreEntraineur = await prisma.membreEquipe.findFirst({
      where: {
        userId: userId,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEntraineur) {
      return {
        success: false,
        message: "Action non autorisée. Vous devez être entraîneur.",
      };
    }

    const idEquipe = membreEntraineur.equipeId;

    // Le joueur à modifier est-il bien dans l'équipe de cet entraîneur ?
    const membreJoueurAModifier = await prisma.membreEquipe.findFirst({
      where: {
        userId: id,
        equipeId: idEquipe,
      },
    });

    if (!membreJoueurAModifier) {
      return {
        success: false,
        message: "Ce joueur n'a pas été trouvé dans votre équipe.",
      };
    }

    if (id === userId) {
      return {
        success: false,
        message: "Vous ne pouvez pas modifier votre propre rôle ici.",
      };
    }
    // Un entraîneur ne peut pas modifier le rôle d'un autre entraîneur
    
    // if (membreJoueurAModifier.role === "ENTRAINEUR" && role) {
    //   return {
    //     success: false,
    //     message: "Vous ne pouvez pas modifier le rôle d'un autre entraîneur.",
    //   };
    // }

    // 4. EFFECTUER LA MISE À JOUR
    const membreMisAJour = await prisma.membreEquipe.update({
      where: {
        id: membreJoueurAModifier.id,
      },
      data: {
        role: role,
      },
    });

    return {
      success: true,
      message: "Rôle modifié avec succès",
      data: membreMisAJour,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre :", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du membre.",
    };
  }
}
