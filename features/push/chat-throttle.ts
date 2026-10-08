/**
 * Chat push grouping: at most one push per recipient and conversation every CHAT_PUSH_WINDOW_MS.
 * Messages arriving in between are only counted; the next push after the window says how many
 * there were ("3 nouveaux messages"), and its tag (the conversation) replaces the previous one.
 */
export const CHAT_PUSH_WINDOW_MS = 3 * 60_000;

export type ChatPushState = { lastPushAt: number; pending: number };

export function chatPushDecision(state: ChatPushState | undefined, now: number, windowMs = CHAT_PUSH_WINDOW_MS) {
  if (state && now - state.lastPushAt < windowMs) {
    return { send: false as const, count: 0, next: { lastPushAt: state.lastPushAt, pending: state.pending + 1 } };
  }
  const count = (state?.pending ?? 0) + 1;
  return { send: true as const, count, next: { lastPushAt: now, pending: 0 } };
}
