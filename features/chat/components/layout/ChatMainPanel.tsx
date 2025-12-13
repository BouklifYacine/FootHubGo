"use client";

import React, { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Conversation, ClubMember, Message } from "../../types";
import { ChatHeader } from "../ChatHeader";
import { MessageList } from "../messages/MessageList";
import { ChatInput } from "../input/ChatInput";
import { BlockedWarning } from "./BlockedWarning";
import { EmptyChat } from "./EmptyChat";

interface ChatMainPanelProps {
  // State
  conversation: Conversation | null;
  messages: Message[];
  messagesLoading: boolean;
  typingUsers: string[];
  // User info
  userId: string | undefined;
  userName: string;
  userImage: string | undefined;
  // Block status
  blockStatus?: {
    isBlockedByMe?: boolean;
    isBlockedByThem?: boolean;
    canChat?: boolean;
  };
  // Club members for adding
  clubMembers: ClubMember[];
  // Mutation states
  isSending: boolean;
  isGroupUpdating: boolean;
  // Mobile
  showChat: boolean;
  // Handlers
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
  onAddMembers: (memberIds: string[]) => void;
  onUpdateConversation: (
    updater: (prev: Conversation | null) => Conversation | null
  ) => void;
}

export const ChatMainPanel = memo(function ChatMainPanel({
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
  onAddMembers,
  onUpdateConversation,
}: ChatMainPanelProps) {
  // Optimistic update handlers
  const handleRename = useCallback(
    (name: string) => {
      onUpdateConversation((prev) => (prev ? { ...prev, name } : null));
      onRenameGroup(name);
    },
    [onUpdateConversation, onRenameGroup]
  );

  const handleKick = useCallback(
    (targetUserId: string) => {
      onUpdateConversation((prev) =>
        prev
          ? {
              ...prev,
              participants: prev.participants.filter(
                (p) => p.id !== targetUserId
              ),
            }
          : null
      );
      onKickMember(targetUserId);
    },
    [onUpdateConversation, onKickMember]
  );

  const handleAddMembers = useCallback(
    (memberIds: string[]) => {
      const newMembers = clubMembers.filter((m) => memberIds.includes(m.id));
      onUpdateConversation((prev) =>
        prev
          ? {
              ...prev,
              participants: [
                ...prev.participants,
                ...newMembers.map((m) => ({
                  id: m.id,
                  name: m.name,
                  image: m.image,
                  isOnline: false,
                })),
              ],
            }
          : null
      );
      onAddMembers(memberIds);
    },
    [onUpdateConversation, onAddMembers, clubMembers]
  );

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
        onRenameGroup={handleRename}
        onKickMember={handleKick}
        onLeaveGroup={onLeaveGroup}
        onDeleteGroup={onDeleteGroup}
        onAddMembers={handleAddMembers}
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

      <ChatInput
        onSend={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        disabled={blockStatus?.canChat === false}
        isLoading={isSending}
        placeholder={
          blockStatus?.canChat === false
            ? "Conversation verrouillée"
            : "Écrivez un message..."
        }
      />
    </div>
  );
});
