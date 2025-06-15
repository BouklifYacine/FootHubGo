"use server";

import { prisma } from "@/prisma";
import { SchemaModifierInfosClub } from "@/features/modifierinfosclub/schemas/SchemaModifierInfosClub";
import { auth } from "@/auth";
import { headers } from "next/headers";
import z from "zod";

type schema = z.infer<typeof SchemaModifierInfosClub>;

export async function ModifierInfosClubAction(id: string, data: schema) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user.id;

  if (!userId) {
    return {
      success: false,
      message: "Non autorisé",
    };
  }

  const validation = SchemaModifierInfosClub.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }
  const Infosajour = validation.data;

  const membreEquipe = await prisma.membreEquipe.findFirst({
    where: {
      equipeId: id,
      userId: userId,
      role: "ENTRAINEUR",
    },
  });

  if (!membreEquipe) {
    return {
      success: false,
      message: "Vous n'etes pas entraineur de cette équipe.",
    };
  }

  await prisma.equipe.update({
    where: { id: id },
    data: Infosajour, // On passe directement les données validées
  });

  return {
    success: true,
    message: `Les infos du club ont été mit a jour`,
  };
}
