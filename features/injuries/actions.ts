"use server";

import { z } from "zod";
import { startOfDay } from "date-fns";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireMember, requireUser } from "@/lib/auth/session";
import { AppError, forbidden, notFound } from "@/lib/errors";
import { injurySchema } from "./schemas";

/** Players can only manage their own injuries. */
async function findOwnInjury(injuryId: string, userId: string) {
  const injury = await prisma.injury.findFirst({ where: { id: injuryId, userId } });
  if (!injury) throw notFound("Blessure introuvable");
  return injury;
}

export const reportInjury = action(injurySchema, async (values) => {
  const { user, membership } = await requireMember();
  if (membership.role !== "PLAYER") throw forbidden("Seuls les joueurs peuvent déclarer une blessure");

  const activeInjury = await prisma.injury.findFirst({
    where: { userId: user.id, endDate: { gt: startOfDay(new Date()) } },
    select: { id: true },
  });
  if (activeInjury) throw new AppError("Tu as déjà une blessure en cours");

  await prisma.injury.create({
    data: { ...values, startDate: new Date(), userId: user.id, teamId: membership.teamId },
  });
  return { message: "Blessure déclarée" };
});

export const updateInjury = action(
  z.object({ injuryId: z.string().min(1), values: injurySchema }),
  async ({ injuryId, values }) => {
    const user = await requireUser();
    const injury = await findOwnInjury(injuryId, user.id);
    await prisma.injury.update({ where: { id: injury.id }, data: values });
    return { message: "Blessure mise à jour" };
  },
);

export const deleteInjury = action(z.string().min(1), async (injuryId) => {
  const user = await requireUser();
  const injury = await findOwnInjury(injuryId, user.id);
  if (injury.endDate < new Date()) throw new AppError("Impossible de supprimer une blessure terminée");

  await prisma.injury.delete({ where: { id: injury.id } });
  return { message: "Blessure supprimée" };
});
