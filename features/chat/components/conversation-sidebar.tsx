"use client";

import { useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ConversationDto } from "../types";
import { ChatAvatar } from "./chat-avatar";
import { NewConversationDialog } from "./new-conversation-dialog";

function formatTime(iso: string) {
  const date = new Date(iso);
  const days = differenceInCalendarDays(new Date(), date);
  if (days === 0) return format(date, "HH:mm");
  if (days === 1) return "Hier";
  if (days < 7) return format(date, "EEEE", { locale: fr });
  return format(date, "dd/MM/yyyy");
}

const byActivity = (a: ConversationDto, b: ConversationDto) => b.updatedAt.localeCompare(a.updatedAt);

type Props = {
  conversations: ConversationDto[];
  myId: string | undefined;
  selectedId: string | null;
  onSelect: (conversationId: string) => void;
  className?: string;
};

/** Club and section channels first, then pinned, then the other conversations by latest activity. */
export function ConversationSidebar({ conversations, myId, selectedId, onSelect, className }: Props) {
  const [search, setSearch] = useState("");
  const visible = conversations
    .filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase()))
    .toSorted(byActivity);
  const isChannel = (c: ConversationDto) => c.type === "TEAM" || c.type === "CLUB";
  const sections = [
    { title: "Club et sections", items: visible.filter(isChannel).toSorted((a, b) => (a.type === "CLUB" ? -1 : b.type === "CLUB" ? 1 : 0)) },
    { title: "Épinglés", items: visible.filter((c) => !isChannel(c) && c.isPinned) },
    { title: "Messages", items: visible.filter((c) => !isChannel(c) && !c.isPinned) },
  ];

  return (
    <aside className={cn("flex flex-col border-r w-full md:w-80", className)}>
      <div className="space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <NewConversationDialog myId={myId} onCreated={onSelect} />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." value={search} />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {visible.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">Aucune conversation</p>}
        {sections.map(({ title, items }) =>
          items.length === 0 ? null : (
            <section key={title} className="mb-2">
              <h3 className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
              {items.map((c) => {
                const other = c.type === "PRIVATE" ? c.participants.find((p) => p.id !== myId) : undefined;
                return (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
                      c.id === selectedId ? "bg-primary/10" : "hover:bg-accent",
                    )}
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    type="button"
                  >
                    <ChatAvatar image={other?.image} isOnline={other?.isOnline} name={c.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{c.name}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatTime(c.updatedAt)}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.lastMessage
                          ? c.lastMessage.deletedForAll
                            ? "Message supprimé"
                            : c.lastMessage.content
                          : "Aucun message"}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-bold text-white">
                        {c.unreadCount > 99 ? "99+" : c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </section>
          ),
        )}
      </nav>
    </aside>
  );
}
