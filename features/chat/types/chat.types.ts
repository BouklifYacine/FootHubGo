// Chat types

export type ConversationType = "PRIVATE" | "GROUP";

export interface Participant {
  id: string;
  name: string;
  image: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderImage: string | null;
  createdAt: string;
  read: boolean;
  readAt: string | null;
  deletedForAll?: boolean;
  isPinned?: boolean;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  creatorId?: string | null;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount: number;
  isPinned: boolean;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  name: string;
  image: string | null;
  role: string;
  poste: string | null;
}

// API response types
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

export interface CreateConversationInput {
  type: ConversationType;
  participantIds: string[];
  name?: string; // Only for group chats
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

export interface CreateConversationResponse {
  conversation: Omit<
    Conversation,
    "lastMessage" | "unreadCount" | "isPinned" | "updatedAt"
  >;
  existed: boolean;
}
