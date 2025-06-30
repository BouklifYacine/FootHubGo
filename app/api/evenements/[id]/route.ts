import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface Props {
  params: { id: string };
}

export async function GET(requete: NextRequest, { params }: Props) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { erreur: "ID de l'événement manquant" },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const idUtilisateur = session?.user.id

  if (!idUtilisateur) {
    return NextResponse.json(
      { erreur: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    // Récupérer l'équipe liée à l'événement
    const evenementAvecEquipe = await prisma.evenement.findUnique({
      where: { id },
      select: {
        equipeId: true
      }
    });

    if (!evenementAvecEquipe) {
      return NextResponse.json(
        { erreur: "Événement introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est membre de l'équipe
    const estMembre = await prisma.membreEquipe.findFirst({
      where: {
        userId: idUtilisateur,
        equipeId: evenementAvecEquipe.equipeId,
      },
    });

    if (!estMembre) {
      return NextResponse.json(
        { erreur: "Accès refusé : vous n'êtes pas membre de l'équipe" },
        { status: 403 }
      );
    }

    // Récupération complète des données de l'événement
    const evenement = await prisma.evenement.findUnique({
      where: { id },
      include: {
        presences: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        },
        statEquipe: true,
        statsJoueur: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!evenement) {
      return NextResponse.json(
        { erreur: "Événement introuvable" },
        { status: 404 }
      );
    }


    const membresEquipe = await prisma.membreEquipe.findMany({
      where: { equipeId: evenementAvecEquipe.equipeId },
      select: {
        userId: true,
        poste: true
      }
    });

    const cartePostes = new Map(
      membresEquipe.map(membre => [membre.userId, membre.poste])
    );

    const reponse = {
      id: evenement.id,
      titre: evenement.titre,
      typeEvenement: evenement.typeEvenement,
      dateDebut: evenement.dateDebut,
      lieu: evenement.lieu,
      adversaire: evenement.adversaire,

      presences: evenement.presences.map(presence => ({
        idUtilisateur: presence.user.id,
        nom: presence.user.name,
        image: presence.user.image,
        poste: cartePostes.get(presence.user.id) || null,
        statut: presence.statut
      })),

      statsEquipe: evenement.statEquipe,

      statsJoueurs: evenement.statsJoueur.map(stats => ({
        id: stats.id,
        idUtilisateur: stats.user.id,
        nom: stats.user.name,
        image: stats.user.image,
        buts: stats.buts,
        passesdecisive: stats.passesdecisive,
        note: stats.note,
        minutesJouees: stats.minutesJouees,
        titulaire: stats.titulaire,
        poste: stats.poste
      }))
    };

    return NextResponse.json(reponse);
  } catch (erreur) {
    console.error("Erreur lors de la récupération de l'événement:", erreur);
    return NextResponse.json(
      { erreur: "Erreur serveur lors du traitement de la requête" },
      { status: 500 }
    );
  }
}