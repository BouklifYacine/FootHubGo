"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Conversation, ClubMember, Message } from "../../types";
import { ChatHeader } from "../ChatHeader";
import { MessageList } from "../messages/MessageList";
import { ChatInput } from "../input/ChatInput";
import { BlockedWarning } from "./BlockedWarning";
import { RateLimitWarning } from "./RateLimitWarning";
import { EmptyChat } from "./EmptyChat";

interface ChatMainPanelProps {
  conversation: Conversation | null;
  messages: Message[];
  messagesLoading: boolean;
  typingUsers: string[];
  userId: string | undefined;
  userName: string;
  userImage: string | undefined;
  blockStatus?: {
    isBlockedByMe?: boolean;
    isBlockedByThem?: boolean;
    canChat?: boolean;
  };
  clubMembers: ClubMember[];
  isSending: boolean;
  isGroupUpdating: boolean;
  isRateLimited: boolean;
  onClearRateLimit: () => void;
  showChat: boolean;
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onDeleteMessage: (messageId: string, type: "forMe" | "forAll") => void;
  onBack: () => void;
  onPinConversation: (action: "pin" | "unpin") => void;
  onBlockUser: (action: "block" | "unblock") => void;
  onRenameGroup: (name: string) => void;
  onKickMember: (userId: string) => void;
  onLeaveGroup: () => void;
  onDeleteGroup: () => void;
  onDeleteConversation: () => void;
  onAddMembers: (memberIds: string[]) => void;
}

export function ChatMainPanel({
  conversation,
  messages,
  messagesLoading,
  typingUsers,
  userId,
  userName,
  userImage,
  blockStatus,
  clubMembers,
  isSending,
  isGroupUpdating,
  isRateLimited,
  onClearRateLimit,
  showChat,
  onSendMessage,
  onTyping,
  onStopTyping,
  onDeleteMessage,
  onBack,
  onPinConversation,
  onBlockUser,
  onRenameGroup,
  onKickMember,
  onLeaveGroup,
  onDeleteGroup,
  onDeleteConversation,
  onAddMembers,
}: ChatMainPanelProps) {
  if (!conversation) {
    return <EmptyChat className={cn(showChat ? "flex" : "hidden md:flex")} />;
  }

  return (
    <div
      className={cn(
        "flex-1 flex flex-col",
        showChat ? "flex" : "hidden md:flex"
      )}
    >
      <ChatHeader
        conversation={conversation}
        userId={userId}
        onBack={onBack}
        onPinConversation={onPinConversation}
        onBlockUser={onBlockUser}
        isBlocked={blockStatus?.isBlockedByMe}
        onRenameGroup={onRenameGroup}
        onKickMember={onKickMember}
        onLeaveGroup={onLeaveGroup}
        onDeleteGroup={onDeleteGroup}
        onDeleteConversation={onDeleteConversation}
        onAddMembers={onAddMembers}
        availableMembers={clubMembers}
        isGroupUpdating={isGroupUpdating}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          isLoading={messagesLoading}
          userId={userId}
          userName={userName}
          userImage={userImage}
          isGroup={conversation.type === "GROUP"}
          conversationId={conversation.id}
          typingUsers={typingUsers}
          onDeleteMessage={onDeleteMessage}
        />
      </div>

      <BlockedWarning
        isBlockedByMe={blockStatus?.isBlockedByMe || false}
        isBlockedByThem={blockStatus?.isBlockedByThem || false}
      />

      <RateLimitWarning
        isRateLimited={isRateLimited}
        onExpire={onClearRateLimit}
      />

      <ChatInput
        onSend={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={blockStatus?.canChat === false || isRateLimited}
        isLoading={isSending}
        placeholder={
          isRateLimited
            ? "Patientez avant d'envoyer..."
            : blockStatus?.canChat === false
              ? "Conversation verrouillée"
              : "Écrivez un message..."
        }
      />
    </div>
  );
}
