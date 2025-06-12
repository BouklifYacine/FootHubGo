"use server";

import { auth } from "@/auth";
import { RejoindreEquipeSchema } from "@/features/rejoindreclub/schema/schemaRejoindreEquipe";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
import z from "zod";

type Schema = z.infer<typeof RejoindreEquipeSchema>;

export async function RejoindreEquipeAction(data: Schema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "Vous devez être connecté pour rejoindre une équipe",
    };
  }

  const validation = RejoindreEquipeSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }

  const { codeInvitation } = validation.data;

  const equipe = await prisma.equipe.findFirst({
    where: { codeInvitation },
  });

  if (!equipe) {
    return {
      success: false,
      message: "Code d'invitation invalide",
    };
  }

  const dejaMembre = await prisma.membreEquipe.findFirst({
    where: { userId },
  });

  if (dejaMembre) {
    return {
      success: false,
      message: "Vous êtes déjà membre d'une équipe",
    };
  }

  await prisma.membreEquipe.create({
    data: {
      equipeId: equipe.id,
      userId,
      role: "JOUEUR",
    },
  });

  return {
    success: true,
    message: `Vous avez rejoint l'équipe ${equipe.nom}`,
  };
}
