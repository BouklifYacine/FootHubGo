"use client";

import React, { memo } from "react";
import { Pin, MessageSquare } from "lucide-react";
import { Conversation } from "../../types";
import { ConversationItem } from "../ConversationItem";

interface ConversationListProps {
  pinnedConversations: Conversation[];
  unpinnedConversations: Conversation[];
  selectedConversationId: string | null;
  userId: string | undefined;
  onSelect: (conversation: Conversation) => void;
}

export const ConversationList = memo(function ConversationList({
  pinnedConversations,
  unpinnedConversations,
  selectedConversationId,
  userId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Pinned Section */}
      {pinnedConversations.length > 0 && (
        <div className="p-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <Pin className="h-3 w-3 text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Épinglés
            </span>
          </div>
          {pinnedConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedConversationId === conv.id}
              userId={userId}
              onClick={() => onSelect(conv)}
            />
          ))}
        </div>
      )}

      {/* All Messages Section */}
      <div className="p-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <MessageSquare className="h-3 w-3 text-zinc-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Tous les messages
          </span>
        </div>
        {unpinnedConversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedConversationId === conv.id}
            userId={userId}
            onClick={() => onSelect(conv)}
          />
        ))}
      </div>
    </div>
  );
});
