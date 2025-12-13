// API request and response types for chat feature

import type { Conversation, Message, ClubMember } from "./entities";

// Response types
export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface MessagesResponse {
  messages: Message[];
  conversationId: string;
}

export interface ClubMembersResponse {
  members: ClubMember[];
}

export interface CreateConversationResponse {
  conversation: Omit<
    Conversation,
    "lastMessage" | "unreadCount" | "isPinned" | "updatedAt"
  >;
  existed: boolean;
}

export interface PinConversationResponse {
  success: boolean;
  action: string;
  conversationId: string;
  isPinned: boolean;
}

export interface BlockStatusResponse {
  isBlockedByMe: boolean;
  isBlockedByThem: boolean;
  canChat: boolean;
}

export interface DeleteMessageResponse {
  success: boolean;
  type: string;
  messageId: string;
}

// Request types
export interface ConversationInput {
  type: "PRIVATE" | "GROUP";
  participantIds: string[];
  name?: string;
}

export interface MessageInput {
  conversationId: string;
  content: string;
}

export interface PinConversationInput {
  conversationId: string;
  action: "pin" | "unpin";
}

export interface BlockUserInput {
  userId: string;
  action: "block" | "unblock";
}

export interface DeleteMessageInput {
  messageId: string;
  conversationId: string;
  type: "forMe" | "forAll";
}
