"use client";

import { formatTime } from "@/lib/format";
import { useEffect, useRef } from "react";
import { Check, CheckCheck, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isPending } from "../cache";
import { useDeleteMessage, useMessages } from "../hooks/use-messages";
import { ChatAvatar } from "./chat-avatar";

type Props = { conversationId: string; myId: string | undefined; showSenders: boolean; typingNames: string[] };

export function MessageList({ conversationId, myId, showSenders, typingNames }: Props) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMessages(conversationId);
  const deleteMessage = useDeleteMessage();
  const bottom = useRef<HTMLDivElement>(null);
  const messages = data?.pages.toReversed().flatMap((page) => page.messages) ?? [];
  const lastId = messages.at(-1)?.id;

  // Follow the newest message (not when older pages are prepended).
  useEffect(() => bottom.current?.scrollIntoView({ block: "end" }), [lastId, typingNames.length]);

  if (isLoading) return <p className="flex-1 p-8 text-center text-sm text-muted-foreground">Chargement...</p>;

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      {hasNextPage && (
        <Button className="mx-auto block" disabled={isFetchingNextPage} onClick={() => fetchNextPage()} size="sm" variant="ghost">
          Charger les messages précédents
        </Button>
      )}
      {messages.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun message. Lancez la discussion !</p>}

      {messages.map((m) => {
        const mine = m.senderId === myId;
        const pending = isPending(m);
        return (
          <div className={cn("group flex items-end gap-2", mine && "flex-row-reverse")} key={m.id}>
            {showSenders && !mine && <ChatAvatar className="size-7" image={m.senderImage} name={m.senderName} />}
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                mine ? "bg-primary text-primary-foreground" : "bg-muted",
                pending && "opacity-60",
              )}
            >
              {showSenders && !mine && <p className="text-xs font-semibold opacity-70">{m.senderName}</p>}
              {m.deletedForAll ? (
                <p className="italic opacity-70">Message supprimé</p>
              ) : (
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
              )}
              <p className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                {formatTime(m.createdAt)}
                {mine && !pending && (m.read ? <CheckCheck className="size-3" /> : <Check className="size-3" />)}
              </p>
            </div>
            {!pending && !m.deletedForAll && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-label="Options du message" className="size-6 opacity-0 group-hover:opacity-100" size="icon" variant="ghost">
                    <MoreVertical className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={mine ? "end" : "start"}>
                  <DropdownMenuItem onClick={() => deleteMessage.mutate({ messageId: m.id, scope: "me" })}>
                    Supprimer pour moi
                  </DropdownMenuItem>
                  {mine && (
                    <DropdownMenuItem onClick={() => deleteMessage.mutate({ messageId: m.id, scope: "all" })}>
                      Supprimer pour tous
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}

      {typingNames.length > 0 && (
        <p className="text-xs italic text-muted-foreground">
          {typingNames.join(", ")} {typingNames.length > 1 ? "écrivent" : "écrit"}...
        </p>
      )}
      <div ref={bottom} />
    </div>
  );
}
