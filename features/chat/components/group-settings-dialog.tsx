"use client";

import { useConfirm } from "@/components/app/confirm-dialog";
import { useState } from "react";
import { Check, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog as Dialog,
  ResponsiveDialogContent as DialogContent,
  ResponsiveDialogDescription as DialogDescription,
  ResponsiveDialogHeader as DialogHeader,
  ResponsiveDialogTitle as DialogTitle,
} from "@/components/app/responsive-dialog";
import { Input } from "@/components/ui/input";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { useClubMembers } from "@/features/clubs/hooks/use-club-members";
import { addGroupMembers, removeGroupMember, renameGroup } from "../actions/groups";
import { GROUP_MAX_MEMBERS } from "../schemas";
import type { ConversationDto } from "../types";
import { ChatAvatar } from "./chat-avatar";

const invalidate = [queryKeys.chat.conversations];

type Props = { conversation: ConversationDto; myId: string | undefined; open: boolean; onOpenChange: (open: boolean) => void };

/** Members of a custom group. Its admin can also rename it, add teammates and remove members. */
export function GroupSettingsDialog({ conversation: c, myId, open, onOpenChange }: Props) {
  const isAdmin = c.myRole === "ADMIN";
  const [name, setName] = useState(c.name);
  const [toAdd, setToAdd] = useState<string[]>([]);
  const { data: clubMembers } = useClubMembers(open && isAdmin);
  const rename = useActionMutation(renameGroup, { invalidate });
  const add = useActionMutation(addGroupMembers, { invalidate, onSuccess: () => setToAdd([]) });
  const remove = useActionMutation(removeGroupMember, { invalidate });
  const confirm = useConfirm();

  const memberIds = new Set(c.participants.map((p) => p.id));
  const candidates = (clubMembers ?? []).filter((m) => !memberIds.has(m.userId));
  const freeSlots = GROUP_MAX_MEMBERS - c.participants.length;
  const toggle = (userId: string) =>
    setToAdd((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : ids.length < freeSlots ? [...ids, userId] : ids,
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Paramètres du groupe</DialogTitle>
          <DialogDescription>
            {c.participants.length}/{GROUP_MAX_MEMBERS} membres
          </DialogDescription>
        </DialogHeader>

        {isAdmin && (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              rename.mutate({ conversationId: c.id, name });
            }}
          >
            <Input aria-label="Nom du groupe" maxLength={50} onChange={(e) => setName(e.target.value)} value={name} />
            <Button disabled={rename.isPending || !name.trim() || name.trim() === c.name} type="submit">
              Renommer
            </Button>
          </form>
        )}

        <section className="space-y-1">
          <h3 className="text-sm font-semibold">Membres</h3>
          {c.participants.map((p) => (
            <div className="flex items-center gap-3 rounded-lg p-2" key={p.id}>
              <ChatAvatar image={p.image} isOnline={p.isOnline} name={p.name} />
              <span className="flex-1 truncate text-sm font-medium">
                {p.name}
                {p.id === myId && " (toi)"}
              </span>
              {p.role === "ADMIN" && <Badge variant="secondary">Admin</Badge>}
              {isAdmin && p.id !== myId && (
                <Button
                  aria-label={`Retirer ${p.name}`}
                  disabled={remove.isPending}
                  onClick={async () => {
                    if (await confirm({ title: `Retirer ${p.name} du groupe ?`, confirmLabel: "Retirer" })) {
                      remove.mutate({ conversationId: c.id, userId: p.id });
                    }
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <UserMinus className="size-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </section>

        {isAdmin && (
          <section className="space-y-1">
            <h3 className="text-sm font-semibold">Ajouter des membres</h3>
            {candidates.length === 0 && (
              <p className="text-sm text-muted-foreground">Tous les membres du club sont déjà dans le groupe.</p>
            )}
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {candidates.map((m) => {
                const selected = toAdd.includes(m.userId);
                return (
                  <button
                    className={cn(
                      "flex min-h-12 w-full items-center gap-3 rounded-lg p-2 text-left outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50",
                      selected && "bg-primary/10",
                    )}
                    aria-pressed={selected}
                    key={m.userId}
                    onClick={() => toggle(m.userId)}
                    type="button"
                  >
                    <ChatAvatar image={m.image} name={m.name} />
                    <span className="flex-1 truncate text-sm font-medium">{m.name}</span>
                    {selected && <Check className="size-4 text-primary" />}
                  </button>
                );
              })}
            </div>
            {candidates.length > 0 && (
              <Button
                className="w-full"
                disabled={add.isPending || toAdd.length === 0}
                onClick={() => add.mutate({ conversationId: c.id, userIds: toAdd })}
              >
                Ajouter{toAdd.length > 0 && ` (${toAdd.length})`}
              </Button>
            )}
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
