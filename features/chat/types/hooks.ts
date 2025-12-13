// Hook-specific types for chat feature

import type { ConversationType } from "./entities";

// Hook input types
export interface CreateConversationInput {
  type: ConversationType;
  participantIds: string[];
  name?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

export interface UpdateGroupInput {
  conversationId: string;
  name: string;
}

export interface DeleteGroupInput {
  conversationId: string;
}

export interface ManageMembersInput {
  conversationId: string;
  memberIds?: string[];
  targetUserId?: string;
  action: "add" | "kick" | "leave";
}

export interface PinMessageInput {
  conversationId: string;
  messageId: string;
}

// WebSocket types
export interface TypingUser {
  id: string;
  name: string;
}

export interface ChatWebSocketState {
  typingUsers: TypingUser[];
  emitTyping: () => void;
  emitStopTyping: () => void;
}
