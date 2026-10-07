import { z } from "zod";

/**
 * Socket.IO protocol shared by the server (`server/realtime`) and the client (`RealtimeProvider`).
 * Every event name and payload lives here, so both sides are type-checked against the same contract.
 * Keep this file free of server-only imports: it is bundled in the browser.
 */

// ---------------------------------------------------------------------------
// DTOs (JSON shapes sent over the wire and returned by the chat / notification GET routes)
// ---------------------------------------------------------------------------

export type ConversationType = "PRIVATE" | "GROUP" | "TEAM" | "CLUB";
export type ParticipantRole = "ADMIN" | "MEMBER";

export type ParticipantDto = {
  id: string;
  name: string;
  image: string | null;
  isOnline: boolean;
  role: ParticipantRole;
};

export type MessageDto = {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  createdAt: string;
  read: boolean;
  deletedForAll: boolean;
};

export type ConversationDto = {
  id: string;
  type: ConversationType;
  /** Group / team name, or the other participant's name for a private conversation. */
  name: string;
  participants: ParticipantDto[];
  lastMessage: MessageDto | null;
  unreadCount: number;
  isPinned: boolean;
  myRole: ParticipantRole;
  /** Private conversations only: blocks between the two users (sending is refused server-side). */
  blocked: { byMe: boolean; byThem: boolean } | null;
  updatedAt: string;
};

export type NotificationDto = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  fromUserName: string | null;
  fromUserImage: string | null;
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type TypingPayload = { conversationId: string; isTyping: boolean };

export type ServerToClientEvents = {
  "notification:new": (notification: NotificationDto) => void;
  "chat:message": (message: MessageDto) => void;
  "chat:message_deleted": (payload: { conversationId: string; messageId: string; forEveryone: boolean }) => void;
  "chat:read": (payload: { conversationId: string; userId: string; readAt: string }) => void;
  "chat:typing": (payload: TypingPayload & { userId: string; userName: string }) => void;
  /** Name, participants or roles changed: refetch the conversation list. */
  "chat:conversation_updated": (payload: { conversationId: string }) => void;
  /** The user lost access to the conversation (deleted, kicked, left the team). */
  "chat:conversation_removed": (payload: { conversationId: string }) => void;
  "presence:changed": (payload: { userId: string; isOnline: boolean }) => void;
};

export type JoinResult = { ok: boolean };

export type ClientToServerEvents = {
  /** Joins the conversation room (typing indicators). Only participants are accepted. */
  "chat:join": (conversationId: string, ack: (result: JoinResult) => void) => void;
  "chat:leave": (conversationId: string) => void;
  "chat:typing": (payload: TypingPayload) => void;
};

export type SocketData = { userId: string; userName: string; sessionId: string };

/** Error message sent by the auth middleware when the session cookie is missing / invalid. */
export const UNAUTHORIZED_ERROR = "unauthorized";

// ---------------------------------------------------------------------------
// Rooms + payload validation (the server never trusts client payloads)
// ---------------------------------------------------------------------------

export const userRoom = (userId: string) => `user:${userId}`;
export const conversationRoom = (conversationId: string) => `conversation:${conversationId}`;

export const conversationIdSchema = z.string().min(1).max(64);

export const typingPayloadSchema = z.object({
  conversationId: conversationIdSchema,
  isTyping: z.boolean(),
});
