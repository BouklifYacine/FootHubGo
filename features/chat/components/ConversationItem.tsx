"use client";

import React, { memo } from "react";
import { Users } from "lucide-react";
import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { cn } from "@/lib/utils";
import { Conversation, Participant } from "../types/chat.types";
import dayjs from "dayjs";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  userId: string | undefined;
  onClick: () => void;
}

function formatTimestamp(date: string) {
  const now = dayjs();
  const messageDate = dayjs(date);

  if (now.diff(messageDate, "day") === 0) {
    return messageDate.format("HH:mm");
  } else if (now.diff(messageDate, "day") === 1) {
    return "Hier";
  } else if (now.diff(messageDate, "day") < 7) {
    return messageDate.format("dddd");
  } else {
    return messageDate.format("DD/MM/YYYY");
  }
}

export const ConversationItem = memo(function ConversationItem({
  conversation: conv,
  isSelected,
  userId,
  onClick,
}: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
        isSelected
          ? "bg-primary/10 dark:bg-primary/20"
          : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
      )}
    >
      <div className="relative">
        {conv.type === "GROUP" ? (
          <div className="relative w-10 h-10">
            <div className="absolute top-0 left-0 w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-950">
              {conv.participants?.[0]?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-950">
              +{(conv.participants?.length || 1) - 1}
            </div>
          </div>
        ) : (
          <>
            <AvatarSimple
              alt={conv.name || ""}
              src={conv.participants?.find((p) => p.id !== userId)?.image || ""}
              Fallback={(conv.name || "??").substring(0, 2).toUpperCase()}
            />
            <div
              className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950",
                conv.participants?.find((p) => p.id !== userId)?.isOnline
                  ? "bg-green-500"
                  : "bg-zinc-400"
              )}
            />
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {conv.type === "GROUP" && (
              <Users className="h-3 w-3 text-zinc-400" />
            )}
            <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
              {conv.name}
            </p>
          </div>
          <span className="text-xs text-zinc-400">
            {conv.lastMessage
              ? formatTimestamp(conv.lastMessage.createdAt)
              : formatTimestamp(conv.updatedAt)}
          </span>
        </div>
        <p className="text-xs text-zinc-500 truncate mt-0.5">
          {conv.lastMessage?.content || "Aucun message"}
        </p>
      </div>

      {conv.unreadCount > 0 && (
        <div className="shrink-0 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">
            {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
          </span>
        </div>
      )}
    </div>
  );
});
