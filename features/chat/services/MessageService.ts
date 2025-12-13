import { ChatService } from "./ChatService";
import type { MessagesResponse, MessageInput, Message } from "../types";

export const MessageService = {
  getByConversation: (conversationId: string): Promise<MessagesResponse> =>
    ChatService.getMessages(conversationId),

  send: (data: MessageInput): Promise<{ message: Message }> =>
    ChatService.sendMessage(data),

  delete: (messageId: string) => ChatService.deleteMessage(messageId),

  markAsRead: (conversationId: string) =>
    ChatService.markAsRead(conversationId),

  pin: (data: { conversationId: string; messageId: string }) =>
    ChatService.pinMessage(data),
};
