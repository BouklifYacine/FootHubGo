import type { Server } from "socket.io";
import { prisma } from "@/prisma";
import { loggableError } from "@/lib/errors";
import {
  conversationRoom,
  userRoom,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from "@/lib/realtime/protocol";

export type RealtimeServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>;

type EventName = keyof ServerToClientEvents;
type EventPayload<E extends EventName> = Parameters<ServerToClientEvents[E]>[0];

/**
 * The Socket.IO server is created by `server.ts` (loaded by tsx) but emitted to from server
 * actions and route handlers (bundled by Next). Those are two module graphs in ONE process,
 * so the instance is shared through `globalThis` rather than a module variable.
 */
const globalForRealtime = globalThis as unknown as { realtimeServer?: RealtimeServer };

export function setIO(io: RealtimeServer) {
  globalForRealtime.realtimeServer = io;
}

/** The Socket.IO server, or null when Next runs without the custom server (`next dev`). */
export function getIO(): RealtimeServer | null {
  return globalForRealtime.realtimeServer ?? null;
}

function emit<E extends EventName>(rooms: string[], event: E, payload: EventPayload<E>) {
  const io = getIO();
  if (!io || rooms.length === 0) return;
  // Socket.IO's typed emit can't infer the args of a generic event name.
  (io.to(rooms).emit as (event: E, payload: EventPayload<E>) => boolean)(event, payload);
}

export function emitToUsers<E extends EventName>(userIds: string[], event: E, payload: EventPayload<E>) {
  emit([...new Set(userIds)].map(userRoom), event, payload);
}

export function emitToUser<E extends EventName>(userId: string, event: E, payload: EventPayload<E>) {
  emit([userRoom(userId)], event, payload);
}

/**
 * Emits to every participant of a conversation (all their tabs, whether or not the conversation
 * is open), so sidebars and unread counters stay live. Never throws: realtime is best effort.
 */
export async function emitToConversation<E extends EventName>(
  conversationId: string,
  event: E,
  payload: EventPayload<E>,
) {
  if (!getIO()) return;
  try {
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    });
    emitToUsers(
      participants.map((participant) => participant.userId),
      event,
      payload,
    );
  } catch (error) {
    console.error("[realtime] emitToConversation failed", loggableError(error));
  }
}

/** Removes the users' sockets from a conversation room (after a kick / leave / delete). */
export function leaveConversationRoom(userIds: string[], conversationId: string) {
  const io = getIO();
  if (!io || userIds.length === 0) return;
  io.in(userIds.map(userRoom)).socketsLeave(conversationRoom(conversationId));
}

/** True when the user has at least one connected tab. */
export async function isUserConnected(userId: string) {
  const io = getIO();
  if (!io) return false;
  const sockets = await io.in(userRoom(userId)).fetchSockets();
  return sockets.length > 0;
}

/**
 * Closes the user's open sockets: every tab (password / email change, account deletion),
 * or only those opened with one session (sign-out). Closed by the server, the client does not
 * reconnect on its own, so a revoked session stops receiving events at once.
 */
export async function disconnectUserSockets(userId: string, sessionId?: string) {
  const io = getIO();
  if (!io) return;
  if (!sessionId) {
    io.in(userRoom(userId)).disconnectSockets(true);
    return;
  }
  const sockets = await io.in(userRoom(userId)).fetchSockets();
  for (const socket of sockets) if (socket.data.sessionId === sessionId) socket.disconnect(true);
}
