"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
  ResponsiveDialogTrigger as DialogTrigger,
} from "@/components/app/responsive-dialog";
import { Input } from "@/components/ui/input";
import { teamRoleLabels } from "@/lib/enum-labels";
import { cn } from "@/lib/utils";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { useCreateConversation } from "../hooks/use-conversations";
import { GROUP_MAX_MEMBERS } from "../schemas";
import { ChatAvatar } from "./chat-avatar";

type Mode = "PRIVATE" | "GROUP";

/** Starts a private conversation or creates a group with members of the user's team. */
export function NewConversationDialog({ myId, onCreated }: { myId?: string; onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("PRIVATE");
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { data: team, isLoading } = useMyTeam();
  const create = useCreateConversation((conversation) => {
    onCreated(conversation.id);
    onOpenChange(false);
  });

  const members = (team?.members ?? []).filter(
    (m) => m.userId !== myId && m.user.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) return;
    setMode("PRIVATE");
    setSearch("");
    setGroupName("");
    setSelected([]);
  }

  const toggle = (userId: string) =>
    setSelected((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : ids.length < GROUP_MAX_MEMBERS - 1 ? [...ids, userId] : ids,
    );

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button aria-label="Nouvelle conversation" size="icon" variant="ghost">
          <Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {(["PRIVATE", "GROUP"] as const).map((value) => (
            <Button key={value} onClick={() => setMode(value)} variant={mode === value ? "default" : "outline"}>
              {value === "PRIVATE" ? "Message privé" : "Groupe"}
            </Button>
          ))}
        </div>
        {mode === "GROUP" && (
          <Input onChange={(e) => setGroupName(e.target.value)} placeholder="Nom du groupe..." value={groupName} />
        )}
        <Input onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un membre..." value={search} />

        <div className="max-h-60 space-y-1 overflow-y-auto">
          {isLoading && <p className="py-4 text-center text-sm text-muted-foreground">Chargement...</p>}
          {!isLoading && members.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Aucun membre trouvé</p>
          )}
          {members.map((m) => {
            const isSelected = selected.includes(m.userId);
            return (
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent disabled:opacity-50",
                  isSelected && "bg-primary/10",
                )}
                disabled={create.isPending}
                key={m.userId}
                onClick={() =>
                  mode === "PRIVATE" ? create.mutate({ type: "PRIVATE", userId: m.userId }) : toggle(m.userId)
                }
                type="button"
              >
                <ChatAvatar image={m.user.image} name={m.user.name} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.user.name}</p>
                  <p className="text-xs text-muted-foreground">{teamRoleLabels[m.role]}</p>
                </div>
                {isSelected && <Check className="size-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {mode === "GROUP" && (
          <Button
            disabled={create.isPending || !groupName.trim() || selected.length === 0}
            onClick={() => create.mutate({ type: "GROUP", name: groupName, userIds: selected })}
          >
            Créer le groupe ({selected.length + 1}/{GROUP_MAX_MEMBERS})
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
