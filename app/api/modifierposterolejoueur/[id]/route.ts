import { SchemaModifierPosteRole } from "@/features/club/modifierposterole/schemas/schemamodifierposterole";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

interface ParametresRoute {
  params: {
    // L'ID de l'utilisateur (le joueur) à modifier
    id: string;
  };
}

// A remplacer par une vraie session en production
const idEntraineur = "Ll4DUDp3JWKDJvhGorreUad4dXdbzTC9";

export async function PATCH(
  request: NextRequest,
  { params }: ParametresRoute
) {
  try {
    // 1. VALIDER LES ENTRÉES
    const { id: idJoueurAModifier } = params;
    const body = await request.json();
    const validation = SchemaModifierPosteRole.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Données invalides.", errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { role, poste } = validation.data;

    // Empêcher une requête vide qui ne ferait rien
    if (!role && !poste) {
      return NextResponse.json(
        { message: "Vous devez fournir au moins un champ à modifier (rôle ou poste)." },
        { status: 400 }
      );
    }

    // 2. VÉRIFIER LES AUTORISATIONS
    // L'utilisateur qui fait la requête est-il bien un entraîneur ?
    const membreEntraineur = await prisma.membreEquipe.findFirst({
      where: {
        userId: idEntraineur,
        role: "ENTRAINEUR",
      },
    });

    if (!membreEntraineur) {
      return NextResponse.json(
        { message: "Action non autorisée. Vous devez être entraîneur." },
        { status: 403 }
      );
    }

    const idEquipe = membreEntraineur.equipeId;

    // Le joueur à modifier est-il bien dans l'équipe de cet entraîneur ?
    const membreJoueurAModifier = await prisma.membreEquipe.findFirst({
      where: {
        userId: idJoueurAModifier,
        equipeId: idEquipe,
      },
    });

    if (!membreJoueurAModifier) {
      return NextResponse.json(
        { message: "Ce joueur n'a pas été trouvé dans votre équipe." },
        { status: 404 }
      );
    }

    // 3. AJOUTER DES GARDE-FOUS (SÉCURITÉ)
    // Un entraîneur ne peut pas se modifier lui-même via cette route
    if (idJoueurAModifier === idEntraineur) {
        return NextResponse.json({ message: "Vous ne pouvez pas modifier votre propre rôle ici." }, { status: 403 });
    }
    // Un entraîneur ne peut pas modifier le rôle d'un autre entraîneur
    if (membreJoueurAModifier.role === "ENTRAINEUR" && role) {
        return NextResponse.json({ message: "Vous ne pouvez pas modifier le rôle d'un autre entraîneur." }, { status: 403 });
    }


    // 4. EFFECTUER LA MISE À JOUR
    const membreMisAJour = await prisma.membreEquipe.update({
      where: {
        // On cible l'enregistrement MembreEquipe par son ID unique pour la mise à jour
        id: membreJoueurAModifier.id,
      },
      data: {
        role: role, // Mettra à jour le rôle si fourni, sinon ignoré (undefined)
        poste: poste, // Mettra à jour le poste si fourni, sinon ignoré
      },
    });

    return NextResponse.json(membreMisAJour);
  } catch (erreur) {
    if (erreur instanceof z.ZodError) {
      return NextResponse.json({ errors: erreur.issues }, { status: 400 });
    }
    console.error("Erreur lors de la mise à jour du membre :", erreur);
    return NextResponse.json(
      { message: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}