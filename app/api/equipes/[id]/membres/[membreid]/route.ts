import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ChangementDonneeJoueur } from "@/app/(schema)/SchemaEquipe";

interface RouteParams {
  params: { id: string; membreid: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { role, posteJoueur } = await request.json();
  const { membreid, id } = await params;
  const idUtilisateur = "cm7q0n4gp0000irv8pjkj764m";

  try {
    const validation = ChangementDonneeJoueur.safeParse({ role, posteJoueur });
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Données invalides",
          erreurs: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const equipe = await prisma.equipe.findUnique({
      where: { id },
    });

    if (!equipe) {
      return NextResponse.json(
        { message: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    const joueurauclub = await prisma.membreEquipe.findUnique({
      where: { userId: membreid },
      include: { user: { select: { name: true } } },
    });

    if (!joueurauclub) {
      return NextResponse.json(
        { message: "Ce joueur ne fait pas partie de ce club" },
        { status: 404 }
      );
    }

    const CoachEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: id,
        role: "ENTRAINEUR",
      },
    });

    if (!CoachEquipe) {
      return NextResponse.json(
        {
          message:
            "Seuls les coach de cette équipe peuvent modifier les données du club",
        },
        { status: 403 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: membreid },
        data: {
          roleEquipe: role,
        },
      });

      const joueurModifie = await tx.membreEquipe.update({
        where: { id: joueurauclub.id },
        data: { role, posteJoueur },
      });

      return joueurModifie;
    });

    return NextResponse.json({
      message: `Le rôle et le poste de ${joueurauclub.user.name} ont été mis à jour`,
      role: result.role,
      poste: result.posteJoueur,
      nomJoueur: joueurauclub.user.name
    });
  } catch (error) {
    console.error(
      "Erreur serveur lors du changement des données du joueur",
      error
    );
    return NextResponse.json(
      { message: "Erreur serveur lors du changement des données du joueur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id , membreid } = await params;
  const idUtilisateur = "cm7q0n4gp0000irv8pjkj764m";

  try {
    const equipeID = await prisma.equipe.findUnique({
      where: { id },
    });

    if (!equipeID) {
      return NextResponse.json(
        { message: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    const joueurauclub = await prisma.membreEquipe.findUnique({
      where: { userId: membreid },
      include: { user: { select: { name: true } } },
    });

    if (!joueurauclub) {
      return NextResponse.json(
        { message: "Ce joueur ne fait pas partie de ce club" },
        { status: 404 }
      );
    }

    const CoachEquipe = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: id,
        role: "ENTRAINEUR",
      },
    });

    if (!CoachEquipe) {
      return NextResponse.json(
        {
          message:
            "Seuls les coach de cette équipe peuvent supprimer les membres du club",
        },
        { status: 403 }
      );
    }
  
    const nomJoueur = joueurauclub.user.name;

    await prisma.$transaction(async (tx) => {
  
      await tx.user.update({
        where: { id: membreid },
        data: {
          roleEquipe: "SANSCLUB",
          AunClub: "NON",
        },
      });

      await tx.membreEquipe.delete({
        where: { id: joueurauclub.id },
      });
    });

    return NextResponse.json({ 
      message: `Le joueur ${nomJoueur} a bien été retiré du club` 
    });
  } catch (error) {
    console.error(
      "Erreur serveur lors de la suppression du membre",
      error
    );
    return NextResponse.json(
      { message: "Erreur serveur lors de la suppression du membre" },
      { status: 500 }
    );
  }
}
