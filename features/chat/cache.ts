import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import type { ConversationDto, MessageDto, MessagesData } from "./types";

/** Pure updaters of the chat query cache, shared by the realtime handlers and the mutations. */

export const PENDING_PREFIX = "pending-";
export const isPending = (message: MessageDto) => message.id.startsWith(PENDING_PREFIX);

/**
 * Adds a message to the newest page, once. A server message replaces the matching optimistic one
 * (same sender + content), whichever of the action response / socket event arrives first.
 */
export function insertMessage(data: MessagesData | undefined, message: MessageDto) {
  if (!data) return data;
  if (data.pages.some((page) => page.messages.some((m) => m.id === message.id))) return data;
  const [newest, ...older] = data.pages;
  const pendingIndex = isPending(message)
    ? -1
    : newest.messages.findIndex(
        (m) => isPending(m) && m.senderId === message.senderId && m.content === message.content,
      );
  const messages =
    pendingIndex === -1 ? [...newest.messages, message] : newest.messages.with(pendingIndex, message);
  return { ...data, pages: [{ ...newest, messages }, ...older] };
}

export function updateMessages(
  data: MessagesData | undefined,
  update: (messages: MessageDto[]) => MessageDto[],
) {
  if (!data) return data;
  return { ...data, pages: data.pages.map((page) => ({ ...page, messages: update(page.messages) })) };
}

export function setMessages(
  queryClient: QueryClient,
  conversationId: string,
  update: (data: MessagesData | undefined) => MessagesData | undefined,
) {
  queryClient.setQueryData<MessagesData>(queryKeys.chat.messages(conversationId), update);
}

export function setConversations(
  queryClient: QueryClient,
  update: (conversations: ConversationDto[]) => ConversationDto[],
) {
  queryClient.setQueryData<ConversationDto[]>(queryKeys.chat.conversations, (old) => old && update(old));
}

export function updateConversation(
  queryClient: QueryClient,
  conversationId: string,
  update: (conversation: ConversationDto) => ConversationDto,
) {
  setConversations(queryClient, (list) => list.map((c) => (c.id === conversationId ? update(c) : c)));
}
