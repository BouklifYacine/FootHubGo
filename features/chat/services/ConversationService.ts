import ky from "ky";
import type {
  ConversationsResponse,
  CreateConversationResponse,
  PinConversationResponse,
  ConversationInput,
  PinConversationInput,
} from "../types";

const api = ky.create({
  prefixUrl: "/api",
});

export const ConversationService = {
  getAll: (): Promise<ConversationsResponse> =>
    api.get("chat/conversations").json<ConversationsResponse>(),

  create: (data: ConversationInput): Promise<CreateConversationResponse> =>
    api
      .post("chat/conversations", { json: data })
      .json<CreateConversationResponse>(),

  update: (conversationId: string, name: string) =>
    api
      .patch(`chat/conversations/${conversationId}`, { json: { name } })
      .json(),

  delete: (conversationId: string) =>
    api.delete(`chat/conversations/${conversationId}`).json(),

  pin: (data: PinConversationInput): Promise<PinConversationResponse> =>
    api
      .post("chat/conversations/pin", { json: data })
      .json<PinConversationResponse>(),
};
