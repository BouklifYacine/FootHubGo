/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/prisma";

type NotificationData = {
  userId: string;
  type: "DEMANDE_ADHESION" | "CONVOCATION_MATCH" | "BLESSURE_DECLAREE" |
   "REJOINT_CLUB" | "QUITTER_CLUB" |"EVENEMENT_RAPPEL" | " SONDAGE_NOUVEAU" | "MESSAGE" | "FINANCE_ECHEANCE";
  title: string;
  message: string;
  data?: any;
};

export async function notifyUser(notification: NotificationData) {
  const notif = await prisma.notification.create({
    data: {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
    },
  });

  try {
    const io = (global as any).io;
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
