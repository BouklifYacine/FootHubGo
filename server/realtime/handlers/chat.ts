import type { Socket } from "socket.io";
import { prisma } from "@/prisma";
import {
  conversationIdSchema,
  conversationRoom,
  typingPayloadSchema,
  type ClientToServerEvents,
  type ServerToClientEvents,
  type SocketData,
} from "@/lib/realtime/protocol";

type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

/** Minimum delay between two relayed "is typing" events of one socket in one conversation. */
const TYPING_THROTTLE_MS = 1500;

/**
 * Conversation rooms only carry ephemeral events (typing). Messages, reads and deletions are
 * emitted by the server actions to the participants' user rooms (see `emitter.ts`).
 */
export function registerChatHandlers(socket: ChatSocket) {
  const { userId, userName } = socket.data;
  /** conversationId -> timestamp of the last relayed "typing: true" */
  const typingSince = new Map<string, number>();

  const stopTyping = (conversationId: string) => {
    if (!typingSince.delete(conversationId)) return;
    socket
      .to(conversationRoom(conversationId))
      .emit("chat:typing", { conversationId, isTyping: false, userId, userName });
  };

  socket.on("chat:join", async (rawConversationId, ack) => {
    const reply = typeof ack === "function" ? ack : () => {};
    const parsed = conversationIdSchema.safeParse(rawConversationId);
    if (!parsed.success) return reply({ ok: false });

    try {
      const participant = await prisma.conversationParticipant.findUnique({
        where: { userId_conversationId: { userId, conversationId: parsed.data } },
        select: { id: true },
      });
      if (!participant) return reply({ ok: false });
      await socket.join(conversationRoom(parsed.data));
      reply({ ok: true });
    } catch (error) {
      console.error("[realtime] chat:join failed", error);
      reply({ ok: false });
    }
  });

  socket.on("chat:leave", (rawConversationId) => {
    const parsed = conversationIdSchema.safeParse(rawConversationId);
    if (!parsed.success) return;
    stopTyping(parsed.data);
    void socket.leave(conversationRoom(parsed.data));
  });

  socket.on("chat:typing", (payload) => {
    const parsed = typingPayloadSchema.safeParse(payload);
    if (!parsed.success) return;
    const { conversationId, isTyping } = parsed.data;
    // Only sockets that were allowed to join the room may talk to it.
    if (!socket.rooms.has(conversationRoom(conversationId))) return;

    if (!isTyping) return stopTyping(conversationId);

    const now = Date.now();
    const last = typingSince.get(conversationId);
    if (last && now - last < TYPING_THROTTLE_MS) return;
    typingSince.set(conversationId, now);
    socket
      .to(conversationRoom(conversationId))
      .emit("chat:typing", { conversationId, isTyping: true, userId, userName });
  });

  // `disconnecting` still has `socket.rooms`, unlike `disconnect`.
  socket.on("disconnecting", () => {
    for (const conversationId of [...typingSince.keys()]) stopTyping(conversationId);
  });
}
