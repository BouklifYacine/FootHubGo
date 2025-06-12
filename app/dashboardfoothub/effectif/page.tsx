import { MiddlewareUtilisateurNonConnecte } from "@/app/(middleware)/MiddlewareUtilisateurNonConnecte";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import React from "react";

async function Effectif() {
  await MiddlewareUtilisateurNonConnecte();

    const session = await auth.api.getSession({
      headers: await headers(),
    });

 const user = await prisma.user.findUnique({
  where: { id: session?.user.id },
  include: {
    MembreEquipe: {
      include: {
        equipe: true, // <--- inclut les infos de l'équipe
      },
    },
  },
});

const equipeUser = user?.MembreEquipe[0]

  return <div>Effectif</div>;
}

export default Effectif;
