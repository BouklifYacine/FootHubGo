"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ConversationSearch } from "../sidebar/ConversationSearch";
import { ConversationList } from "../sidebar/ConversationList";
import { NewConversationDialog } from "../NewConversationDialog";
import { Conversation, ClubMember } from "../../types";

interface ChatSidebarProps {
  conversations: {
    pinned: Conversation[];
    unpinned: Conversation[];
  };
  selectedConversationId: string | null;
  userId: string | undefined;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
  // New conversation dialog props
  newConvoOpen: boolean;
  onNewConvoOpenChange: (open: boolean) => void;
  clubMembers: ClubMember[];
  onStartConversation: (member: ClubMember) => void;
  onCreateGroup: (name: string, memberIds: string[]) => void;
  membersLoading: boolean;
  isCreating: boolean;
  // Mobile
  showChat: boolean;
}

export function ChatSidebar({
  conversations,
  selectedConversationId,
  userId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  newConvoOpen,
  onNewConvoOpenChange,
  clubMembers,
  onStartConversation,
  onCreateGroup,
  membersLoading,
  isCreating,
  showChat,
}: ChatSidebarProps) {
  return (
    <div
      className={cn(
        "border-r border-zinc-200 dark:border-zinc-800 flex flex-col",
        "w-full md:w-80",
        showChat ? "hidden md:flex" : "flex"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Messages
          </h2>
          <NewConversationDialog
            open={newConvoOpen}
            onOpenChange={onNewConvoOpenChange}
            members={clubMembers}
            onSelectMember={onStartConversation}
            onCreateGroup={onCreateGroup}
            isLoading={membersLoading}
            isCreating={isCreating}
          />
        </div>
        <ConversationSearch value={searchQuery} onChange={onSearchChange} />
      </div>

      {/* Conversation List */}
      <ConversationList
        pinnedConversations={conversations.pinned}
        unpinnedConversations={conversations.unpinned}
        selectedConversationId={selectedConversationId}
        userId={userId}
        onSelect={onSelectConversation}
      />
    </div>
  );
}
