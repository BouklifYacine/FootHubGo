"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { headers } from "next/headers";

export async function SupprimerClubAction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!id) {
    return {
      success: false,
      message: "L'identifiant du club est manquant.",
    };
  }

  const Entraineur = await prisma.membreEquipe.findFirst({
    where: {
      userId,
      equipeId: id,
      role: "ENTRAINEUR",
    },
  });

  if (!Entraineur) {
    return {
      success: false,
      message: "Vous devez etre entraineur pour supprimer le club",
    };
  }

  const ClubSupprimer = await prisma.equipe.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Le club " + ClubSupprimer.nom + " a bien été supprimer ",
  };
}
