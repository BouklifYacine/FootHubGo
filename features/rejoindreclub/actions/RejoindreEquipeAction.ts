"use server";

import { auth } from "@/auth";
import { RejoindreEquipeSchema } from "@/features/rejoindreclub/schema/schemaRejoindreEquipe";
import { prisma } from "@/prisma";
import { headers } from "next/headers";
// Make sure this path is correct based on your project structure
import { notifyUser } from "@/features/notifications/notifyUser"; 
import z from "zod";

type Schema = z.infer<typeof RejoindreEquipeSchema>;

export async function RejoindreEquipeAction(data: Schema) {

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;
  const userName = session?.user.name;

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
      message: "Vous êtes déjà membre d'une équipe. Quittez-la d'abord.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.membreEquipe.create({
      data: {
        equipeId: equipe.id,
        userId,
        role: "JOUEUR",
      },
    });

    await tx.demandeAdhesion.deleteMany({
      where: {
        userId: userId,
        statut: "ATTENTE",
      },
    });
  });

  const entraineurs = await prisma.membreEquipe.findMany({
    where: {
      equipeId: equipe.id,
      role: "ENTRAINEUR",
    },
  });

  await Promise.all(
    entraineurs.map((entraineur) => {
      if (entraineur.userId === userId) return;

      return notifyUser({
        userId: entraineur.userId,
        type: "REJOINT_CLUB",
        title: "Nouveau membre !",
        message: `${userName} a rejoint l'équipe avec le code d'invitation.`,
        fromUserName: userName || undefined,
        fromUserImage: session?.user.image || undefined,
      });
    })
  );

  return {
    success: true,
    message: `Bienvenue ! Vous avez rejoint l'équipe ${equipe.nom}`,
  };
}