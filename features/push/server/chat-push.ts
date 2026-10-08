import { prisma } from "@/prisma";
import { loggableError } from "@/lib/errors";
import { isUserConnected } from "@/server/realtime/emitter";
import { chatPushDecision, type ChatPushState } from "../chat-throttle";
import { chatPayload } from "../payload";
import { sendPush } from "./send-push";

/**
 * Grouping state per `recipient:conversation`, in memory (one process, like the rate limits; a
 * restart at worst sends one extra push). Kept on globalThis so dev reloads keep it; bounded.
 */
const states = ((globalThis as { chatPushStates?: Map<string, ChatPushState> }).chatPushStates ??= new Map());
const MAX_STATES = 20_000;

/**
 * Pushes a new chat message to the participants who have NO open tab (the others get it live
 * through Socket.IO), at most once per conversation every few minutes (see chat-throttle.ts).
 * Never throws, never delays the send: called without await.
 */
export async function pushChatMessage(input: { conversationId: string; senderId: string; senderName: string; content: string }) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
      select: { type: true, name: true, participants: {
          // Never the sender, never someone who blocked them.
          where: { userId: { not: input.senderId }, user: { blockedUsers: { none: { id: input.senderId } } } },
          select: { userId: true },
        },
      },
    });
    if (!conversation) return;

    const offline: string[] = [];
    for (const { userId } of conversation.participants) {
      if (!(await isUserConnected(userId))) offline.push(userId);
    }

    const now = Date.now();
    const byCount = new Map<number, string[]>();
    for (const userId of offline) {
      const key = `${userId}:${input.conversationId}`;
      const decision = chatPushDecision(states.get(key), now);
      states.delete(key); // re-insert: the Map stays ordered by last activity
      states.set(key, decision.next);
      if (decision.send) byCount.set(decision.count, [...(byCount.get(decision.count) ?? []), userId]);
    }
    if (states.size > MAX_STATES) {
      for (const key of states.keys()) {
        if (states.size <= MAX_STATES * 0.9) break;
        states.delete(key);
      }
    }

    await Promise.all(
      [...byCount].map(([count, userIds]) =>
        sendPush(
          userIds,
          "messages",
          chatPayload({
            conversationId: input.conversationId,
            conversationType: conversation.type,
            conversationName: conversation.name,
            senderName: input.senderName,
            content: input.content,
            count,
          }),
        ),
      ),
    );
  } catch (error) {
    console.error("[push] chat push failed", loggableError(error));
  }
}
