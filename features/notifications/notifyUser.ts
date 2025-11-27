// lib/notifyUser.ts
import { prisma } from "@/prisma";

type NotificationData = {
  userId: string;
  fromUserName?: string;
  fromUserImage?: string;
  type:
    | "DEMANDE_ADHESION"
    | "CONVOCATION_MATCH"
    | "BLESSURE_DECLAREE"
    | "REJOINT_CLUB"
    | "QUITTER_CLUB"
    | "EVENEMENT_RAPPEL"
    | "SONDAGE_NOUVEAU"
    | "MESSAGE"
    | "FINANCE_ECHEANCE";
  title: string;
  message: string;
};

export async function notifyUser(notification: NotificationData) {
  const notif = await prisma.notification.create({
    data: {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      fromUserName: notification.fromUserName,
      fromUserImage: notification.fromUserImage,
    },
  });

  try {
    const io = (globalThis as any).io;
    if (io) {
      io.to(`user:${notification.userId}`).emit("notification", notif);

      await prisma.notification.update({
        where: { id: notif.id },
        data: { delivered: true },
      });
    }
  } catch (error) {
    console.log("WebSocket non disponible", error);
  }

  return notif;
}
