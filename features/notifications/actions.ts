"use server";

import { z } from "zod";
import { prisma } from "@/prisma";
import { action } from "@/lib/actions/action";
import { requireUser } from "@/lib/auth/session";

export const markNotificationRead = action(z.string().min(1), async (notificationId) => {
  const user = await requireUser();
  // Scoped by user: marking someone else's notification is a silent no-op.
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true },
  });
  return { message: "Notification lue" };
});

export const markAllNotificationsRead = action(z.void(), async () => {
  const user = await requireUser();
  await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  return { message: "Toutes les notifications sont lues" };
});
