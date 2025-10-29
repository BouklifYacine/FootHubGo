import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;
  if (!userId)
    return NextResponse.json("Vous n'etes pas connecté", { status: 400 });

  // 1. On récupère le lien membre-équipes de l'utilisateur
  const membre = await prisma.membreEquipe.findFirst({
    where: { userId },
    include: { equipe: true },
  });

if (!membre) {
  return NextResponse.json({
    equipe: null,
    membres: [],
    role: "SANSCLUB",
  });
}

  // 2. On récupère tous les membres de cette équipe, avec les infos utilisateur
  const membres = await prisma.membreEquipe.findMany({
    where: { equipeId: membre.equipeId },
    include : {user :  {
      select : {
        name : true,
        image : true, 
        email : true        
      }
    }
    },

  });



    //   const joueurs = await prisma.membreEquipe.findMany({
    //   where: { 
    //     equipeId: membre.equipeId,
      
    //   },
    //   select: {
    //     id: true,
    //     poste: true,
    //     isLicensed: true,
    //     joinedAt: true,
    //     user: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //         image: true
    //       }
    //     }
    //   },
    // });

 
    // const resultat = joueurs.map(j => ({
    //   id: j.user.id,
    //   membreId: j.id, 
    //   nom: j.user.name,
    //   email: j.user.email,
    //   photo: j.user.image,
    //   poste: j.poste,
    //   license: j.isLicensed,
    //   dateAdhesion: j.joinedAt
    // }));

  // 3. On retourne l'équipe et la liste des membres
  return NextResponse.json({
    equipe: membre.equipe,
    membres,
    role : membre.role
  });
}