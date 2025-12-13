"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Ban,
  Pin,
  Settings,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarSimple from "@/components/Avatar/AvatarSimple";
import { Conversation, ClubMember } from "../types/chat.types";
import { GroupSettingsDialog } from "./GroupSettingsDialog";

interface ChatHeaderProps {
  conversation: Conversation;
  userId: string | undefined;
  onBack: () => void;
  onPinConversation?: (action: "pin" | "unpin") => void;
  onBlockUser?: (action: "block" | "unblock") => void;
  isBlocked?: boolean;
  onRenameGroup?: (name: string) => void;
  onKickMember?: (userId: string) => void;
  onLeaveGroup?: () => void;
  onDeleteGroup?: () => void;
  onDeleteConversation?: () => void;
  onAddMembers?: (memberIds: string[]) => void;
  availableMembers?: ClubMember[];
  isGroupUpdating?: boolean;
}

export function ChatHeader({
  conversation,
  userId,
  onBack,
  onPinConversation,
  onBlockUser,
  isBlocked,
  onRenameGroup,
  onKickMember,
  onLeaveGroup,
  onDeleteGroup,
  onDeleteConversation,
  onAddMembers,
  availableMembers,
  isGroupUpdating,
}: ChatHeaderProps) {
  const isCreator = conversation.creatorId === userId;
  const isGroup = conversation.type === "GROUP";
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="h-16 px-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {isGroup ? (
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {conversation.participants?.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-900"
                >
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
              {(conversation.participants?.length || 0) > 3 && (
                <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 border-2 border-white dark:border-zinc-900">
                  +{(conversation.participants?.length || 0) - 3}
                </div>
              )}
            </div>
          </div>
        ) : (
          <AvatarSimple
            alt={conversation.name || ""}
            src={
              conversation.participants?.find((p) => p.id !== userId)?.image ||
              ""
            }
            Fallback={(conversation.name || "??").substring(0, 2).toUpperCase()}
          />
        )}

        <div>
          <p className="font-semibold text-zinc-900 dark:text-white">
            {conversation.name}
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              isGroup
                ? "text-zinc-500"
                : conversation.participants?.find((p) => p.id !== userId)
                      ?.isOnline
                  ? "text-green-500"
                  : "text-zinc-400"
            )}
          >
            {isGroup
              ? `${conversation.participants?.length} participants`
              : conversation.participants?.find((p) => p.id !== userId)
                    ?.isOnline
                ? "En ligne"
                : "Hors ligne"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Phone className="h-4 w-4 text-zinc-500" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Video className="h-4 w-4 text-zinc-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <MoreVertical className="h-4 w-4 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() =>
                onPinConversation?.(conversation.isPinned ? "unpin" : "pin")
              }
              className="cursor-pointer gap-2"
            >
              <Pin className="h-4 w-4" />
              <span>{conversation.isPinned ? "Désépingler" : "Épingler"}</span>
            </DropdownMenuItem>

            {isGroup && onRenameGroup && onDeleteGroup && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSettingsOpen(true)}
                  className="cursor-pointer gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Paramètres du groupe</span>
                </DropdownMenuItem>
              </>
            )}

            {!isGroup && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onBlockUser?.(isBlocked ? "unblock" : "block")}
                  className={cn(
                    "cursor-pointer gap-2",
                    isBlocked
                      ? "text-zinc-900 dark:text-zinc-100"
                      : "text-red-600 dark:text-red-500"
                  )}
                >
                  <Ban className="h-4 w-4" />
                  <span>{isBlocked ? "Débloquer" : "Bloquer"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteConversation?.()}
                  className="cursor-pointer gap-2 text-red-600 dark:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer la conversation</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {isGroup && onRenameGroup && onDeleteGroup && (
          <GroupSettingsDialog
            conversation={conversation}
            currentUserId={userId || ""}
            isCreator={isCreator}
            onRename={onRenameGroup}
            onKick={onKickMember || (() => {})}
            onLeave={onLeaveGroup || (() => {})}
            onDelete={onDeleteGroup}
            onAddMembers={onAddMembers}
            availableMembers={availableMembers}
            isUpdating={isGroupUpdating || false}
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
          />
        )}
      </div>
    </div>
  );
}
