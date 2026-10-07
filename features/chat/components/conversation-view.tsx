"use client";

import { useEffect } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  useDeleteConversation,
  useLeaveGroup,
  useMarkConversationRead,
  usePinConversation,
  useSetUserBlocked,
} from "../hooks/use-conversations";
import { useTyping } from "../hooks/use-typing";
import type { ConversationDto } from "../types";
import { ChatAvatar } from "./chat-avatar";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";

type Props = { conversation: ConversationDto; myId: string | undefined; onClose: () => void };

/** Header + messages + composer of the open conversation. Key it by conversation id. */
export function ConversationView({ conversation: c, myId, onClose }: Props) {
  const { typingNames, notifyTyping } = useTyping(c.id);
  const { mutate: markRead } = useMarkConversationRead();
  const pin = usePinConversation();
  const block = useSetUserBlocked();
  const leave = useLeaveGroup();
  const remove = useDeleteConversation();
  const other = c.type === "PRIVATE" ? c.participants.find((p) => p.id !== myId) : undefined;
  const canDelete = c.type === "PRIVATE" || (c.type === "GROUP" && c.myRole === "ADMIN");

  // Opening the conversation, and every message received while it is open, marks it read.
  useEffect(() => {
    if (c.unreadCount > 0) markRead(c.id);
  }, [c.id, c.unreadCount, markRead]);

  const disabledReason = c.blocked?.byMe
    ? "Vous avez bloqué cet utilisateur."
    : c.blocked?.byThem
      ? "Vous ne pouvez pas répondre à cette conversation."
      : undefined;

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b p-3">
        <Button aria-label="Retour" className="md:hidden" onClick={onClose} size="icon" variant="ghost">
          <ArrowLeft className="size-4" />
        </Button>
        <ChatAvatar image={other?.image} isOnline={other?.isOnline} name={c.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{c.name}</p>
          <p className="text-xs text-muted-foreground">
            {other ? (other.isOnline ? "En ligne" : "Hors ligne") : `${c.participants.length} membres`}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="Options de la conversation" size="icon" variant="ghost">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {c.type !== "TEAM" && (
              <DropdownMenuItem onClick={() => pin.mutate({ conversationId: c.id, pinned: !c.isPinned })}>
                {c.isPinned ? "Désépingler" : "Épingler"}
              </DropdownMenuItem>
            )}
            {other && (
              <DropdownMenuItem onClick={() => block.mutate({ userId: other.id, blocked: !c.blocked?.byMe })}>
                {c.blocked?.byMe ? "Débloquer" : "Bloquer"}
              </DropdownMenuItem>
            )}
            {c.type === "GROUP" && c.myRole !== "ADMIN" && myId && (
              <DropdownMenuItem onClick={() => leave.mutate({ conversationId: c.id, userId: myId }, { onSuccess: onClose })}>
                Quitter le groupe
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => confirm("Supprimer cette conversation ?") && remove.mutate(c.id, { onSuccess: onClose })}
              >
                Supprimer
              </DropdownMenuItem>
            )}
            {c.type === "TEAM" && <DropdownMenuItem disabled>Salon de l&apos;équipe</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <MessageList conversationId={c.id} myId={myId} showSenders={c.type !== "PRIVATE"} typingNames={typingNames} />
      <MessageComposer conversationId={c.id} disabledReason={disabledReason} onTyping={notifyTyping} />
    </section>
  );
}
