"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireUser } from "@/lib/auth/session";
import { ONBOARDING_KEYS } from "./keys";

/** Remembers that the user saw a tour (or dismissed the checklist), on every device. Idempotent. */
export const markOnboardingSeen = action(z.enum(ONBOARDING_KEYS), async (key) => {
  const user = await requireUser();
  const { onboardingSeen } = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { onboardingSeen: true } });
  if (!onboardingSeen.includes(key)) {
    await prisma.user.update({ where: { id: user.id }, data: { onboardingSeen: { push: key } } });
  }
  return { message: "C'est noté" };
});
