import type { NotificationType } from "@/generated/prisma/enums";

/**
 * What the service worker receives (encrypted end to end by Web Push). It only carries what the
 * in-app notification already shows (title + text) and the page to open: no ids beyond the URL,
 * no email, no avatar.
 */
export type PushPayload = {
  title: string;
  body: string;
  /** Page of the app opened on tap (always a path under /app). */
  url: string;
  /** Same tag = the new notification replaces the previous one on the device. */
  tag: string;
};

export const PUSH_TITLE_MAX = 80;
export const PUSH_BODY_MAX = 180;

const truncate = (text: string, max: number) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
};

/** Only a path of the app: anything else opens the home. */
export function safeAppUrl(url: string | null | undefined) {
  return typeof url === "string" && /^\/app(\/|\?|$)/.test(url) && !url.startsWith("//") ? url : "/app";
}

/** Payload of a stored notification (`notifyUser`). */
export function notificationPayload(input: { type: NotificationType; title: string; message: string; url?: string | null }): PushPayload {
  const url = safeAppUrl(input.url);
  return {
    title: truncate(input.title, PUSH_TITLE_MAX),
    body: truncate(input.message, PUSH_BODY_MAX),
    url,
    // One notification per kind and page: a newer call-up answer replaces the previous one.
    tag: `${input.type.toLowerCase()}:${url}`,
  };
}

/**
 * Payload of a chat message. One tag per conversation, so the device keeps a single notification
 * per conversation; `count` = messages since the last push of this conversation.
 */
export function chatPayload(input: {
  conversationId: string;
  conversationType: "PRIVATE" | "GROUP" | "TEAM" | "CLUB";
  conversationName: string | null;
  senderName: string;
  content: string;
  count: number;
}): PushPayload {
  const isPrivate = input.conversationType === "PRIVATE";
  const title = isPrivate ? input.senderName : (input.conversationName ?? "Groupe");
  const preview = isPrivate ? input.content : `${input.senderName} : ${input.content}`;
  const body = input.count > 1 ? `${input.count} nouveaux messages. Dernier : ${preview}` : preview;
  return {
    title: truncate(title, PUSH_TITLE_MAX),
    body: truncate(body, PUSH_BODY_MAX),
    url: `/app/chat?c=${encodeURIComponent(input.conversationId)}`,
    tag: `chat:${input.conversationId}`,
  };
}
