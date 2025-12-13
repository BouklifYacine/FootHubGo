import ky from "ky";
import type {
  ConversationsResponse,
  MessagesResponse,
  ClubMembersResponse,
  CreateConversationResponse,
  PinConversationResponse,
  BlockStatusResponse,
  ConversationInput,
  MessageInput,
  PinConversationInput,
  BlockUserInput,
} from "../types";
import type { Conversation, Message } from "../types";

const api = ky.create({
  prefixUrl: "/api",
});

export const ChatService = {
  // Conversations
  getConversations: (): Promise<ConversationsResponse> =>
    api.get("chat/conversations").json<ConversationsResponse>(),

  createConversation: (
    data: ConversationInput
  ): Promise<CreateConversationResponse> =>
    api
      .post("chat/conversations", { json: data })
      .json<CreateConversationResponse>(),

  updateConversation: (conversationId: string, name: string) =>
    api
      .patch(`chat/conversations/${conversationId}`, { json: { name } })
      .json(),

  deleteConversation: (conversationId: string) =>
    api.delete(`chat/conversations/${conversationId}`).json(),

  // Messages
  getMessages: (conversationId: string): Promise<MessagesResponse> =>
    api
      .get(`chat/messages?conversationId=${conversationId}`)
      .json<MessagesResponse>(),

  sendMessage: (data: MessageInput): Promise<{ message: Message }> =>
    api.post("chat/messages", { json: data }).json<{ message: Message }>(),

  deleteMessage: (messageId: string) =>
    api.delete(`chat/messages/${messageId}`).json(),

  markAsRead: (conversationId: string) =>
    api.post("chat/messages/read", { json: { conversationId } }).json(),

  // Pinning
  pinConversation: (
    data: PinConversationInput
  ): Promise<PinConversationResponse> =>
    api
      .post("chat/conversations/pin", { json: data })
      .json<PinConversationResponse>(),

  pinMessage: (data: { conversationId: string; messageId: string }) =>
    api.post("chat/messages/pin", { json: data }).json(),

  // Members
  getClubMembers: (): Promise<ClubMembersResponse> =>
    api.get("chat/members").json<ClubMembersResponse>(),

  addMembers: (conversationId: string, memberIds: string[]) =>
    api
      .post(`chat/conversations/${conversationId}/members`, {
        json: { memberIds },
      })
      .json(),

  removeMember: (conversationId: string, userId: string) =>
    api
      .delete(`chat/conversations/${conversationId}/members?userId=${userId}`)
      .json(),

  // Blocking
  blockUser: (data: BlockUserInput) =>
    api.post("users/block", { json: data }).json(),

  getBlockStatus: (targetId: string): Promise<BlockStatusResponse> =>
    api.get(`users/block?targetId=${targetId}`).json<BlockStatusResponse>(),
};
