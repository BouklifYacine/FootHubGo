import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    //   const session = await auth.api.getSession({
    //     headers: await headers(),
    //   });
    
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { message: "Vous devez être connecté pour accéder à vos présences" },
    //     { status: 401 }
    //   );
    // }

    // const idUtilisateur = session.user.id;

       const idUtilisateur = "WXy4jylVHogXq4omfvR0gaGPuYdospk0"

    // Récupérer toutes les présences de l'utilisateur
    const presences = await prisma.presence.findMany({
      where: {
        userId: idUtilisateur,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        evenement: {
          select: {
            id: true,
            titre: true,
            typeEvenement: true,
            description: true,
            lieu: true,
            dateDebut: true,
          },
        },
      },
      orderBy: {
        evenement: {
          dateDebut: "desc",
        },
      },
    });

    // Vérifier si des présences ont été trouvées
    if (presences.length === 0) {
      console.log("Aucune présence trouvée pour l'utilisateur:", idUtilisateur);
    } else {
      console.log(`${presences.length} présence(s) trouvée(s) pour l'utilisateur:`, idUtilisateur);
    }

    // Transformer les données pour le frontend
    const reponsePresences = presences.map((presence) => ({
      evenementId: presence.evenementId,
      titre: presence.evenement.titre,
      typeEvenement: presence.evenement.typeEvenement,
      description: presence.evenement.description,
      lieu: presence.evenement.lieu,
      dateDebut: presence.evenement.dateDebut,
      name: presence.user.name,
      image: presence.user.image,
      statut: presence.statut,
      dateCreation: presence.dateCreation,
    }));

    return NextResponse.json(reponsePresences);
  } catch (error) {
    console.error("Erreur lors de la récupération des présences:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
} 