"use client";

import React, { memo } from "react";
import { MoreVertical, Check, CheckCheck, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { cn } from "@/lib/utils";
import { Message } from "../types/chat.types";
import dayjs from "dayjs";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  userName: string;
  userImage: string | undefined;
  isGroup: boolean;
  conversationId: string;
  onDelete?: (messageId: string, type: "forMe" | "forAll") => void;
}

export const MessageBubble = memo(function MessageBubble({
  message: msg,
  isOwn,
  userName,
  userImage,
  isGroup,
  conversationId,
  onDelete,
}: MessageBubbleProps) {
  // Show deleted message placeholder
  if (msg.deletedForAll) {
    return (
      <div
        className={cn(
          "flex items-end gap-1.5",
          isOwn ? "justify-end" : "justify-start"
        )}
      >
        {!isOwn && (
          <AvatarSimple
            alt={msg.senderName}
            src={msg.senderImage || ""}
            Fallback={msg.senderName.substring(0, 2).toUpperCase()}
          />
        )}
        <div
          className={cn(
            "px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-dashed border-zinc-300 dark:border-zinc-700",
            isOwn ? "rounded-br-md" : "rounded-bl-md"
          )}
        >
          <p className="text-sm text-zinc-400 italic flex items-center gap-1.5">
            <Ban className="h-3.5 w-3.5" />
            Ce message a été supprimé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-1.5 group",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for other user */}
      {!isOwn && (
        <AvatarSimple
          alt={msg.senderName}
          src={msg.senderImage || ""}
          Fallback={msg.senderName.substring(0, 2).toUpperCase()}
        />
      )}

      {/* Message bubble with more options */}
      <div className="flex flex-col items-end gap-1">
        <div
          className={cn(
            "flex items-center gap-2",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl relative",
              isOwn
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md shadow-md"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md"
            )}
          >
            {/* Show sender name in group chats */}
            {isGroup && !isOwn && (
              <p className="text-[10px] font-semibold text-primary mb-1">
                {msg.senderName}
              </p>
            )}
            <p className="text-sm">{msg.content}</p>
            <p
              className={cn(
                "text-[10px] mt-1 flex items-center gap-1",
                isOwn ? "text-white/70" : "text-zinc-400"
              )}
            >
              {dayjs(msg.createdAt).format("HH:mm")}
              {/* Seen indicator for my messages */}
              {isOwn && (
                <span className="flex items-center gap-0.5">
                  {msg.read ? (
                    <CheckCheck className="h-3 w-3 text-blue-300" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  {msg.readAt && (
                    <span className="text-[9px]">
                      Vu {dayjs(msg.readAt).format("HH:mm")}
                    </span>
                  )}
                </span>
              )}
            </p>
          </div>

          {/* More options dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isOwn ? "start" : "end"}
              className="w-48"
            >
              {/* Delete for me */}
              <DropdownMenuItem
                onClick={() => onDelete?.(msg.id, "forMe")}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer pour moi
              </DropdownMenuItem>

              {/* Delete for everyone (only for own messages) */}
              {isOwn && (
                <DropdownMenuItem
                  onClick={() => onDelete?.(msg.id, "forAll")}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Supprimer pour tous
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar for my messages - UNDER the message */}
        {isOwn && (
          <div className="scale-75 -mt-1">
            <AvatarSimple
              alt={userName}
              src={userImage || ""}
              Fallback={userName.substring(0, 2).toUpperCase()}
            />
          </div>
        )}
      </div>
    </div>
  );
});
