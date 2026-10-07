import { prisma } from "@/prisma";
import { userRoom } from "@/lib/realtime/protocol";
import { emitToUsers, type RealtimeServer } from "../emitter";

/**
 * Online status: a user is online while at least one tab is connected.
 * Changes are pushed to everyone who shares a conversation with the user.
 */
export async function updatePresence(io: RealtimeServer, userId: string) {
  const sockets = await io.in(userRoom(userId)).fetchSockets();
  const isOnline = sockets.length > 0;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isOnline: true } });
  if (!user || user.isOnline === isOnline) return;

  await prisma.user.update({
    where: { id: userId },
    data: isOnline ? { isOnline } : { isOnline, lastSeen: new Date() },
  });

  const contacts = await prisma.conversationParticipant.findMany({
    where: { userId: { not: userId }, conversation: { participants: { some: { userId } } } },
    select: { userId: true },
    distinct: ["userId"],
  });
  emitToUsers(
    contacts.map((contact) => contact.userId),
    "presence:changed",
    { userId, isOnline },
  );
}
