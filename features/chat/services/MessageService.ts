import ky from "ky";
import type { MessagesResponse, MessageInput, Message } from "../types";

const api = ky.create({
  prefixUrl: "/api",
});

export const MessageService = {
  getByConversation: (conversationId: string): Promise<MessagesResponse> =>
    api
      .get(`chat/messages?conversationId=${conversationId}`)
      .json<MessagesResponse>(),

  send: (data: MessageInput): Promise<{ message: Message }> =>
    api.post("chat/messages", { json: data }).json<{ message: Message }>(),

  delete: (messageId: string) =>
    api.delete(`chat/messages/${messageId}`).json(),

  markAsRead: (conversationId: string) =>
    api.post("chat/messages/read", { json: { conversationId } }).json(),

  pin: (data: { conversationId: string; messageId: string }) =>
    api.post("chat/messages/pin", { json: data }).json(),
};
