"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { joinTeamWithCode } from "../actions";
import { INVITE_CODE_LENGTH, formatInviteCode, normalizeInviteCode } from "../invite-code";

/** "Rejoindre un club" button + dialog asking for the invite code (XXXX-XXXX-XXXX). */
export function JoinTeamDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  const join = useActionMutation(joinTeamWithCode, {
    invalidate: [queryKeys.me.all, queryKeys.home, queryKeys.teams.all],
    onSuccess: () => {
      setOpen(false);
      router.push("/app/squad");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setCode("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          Rejoindre un club
          <Send className="ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            join.mutate({ inviteCode: code });
          }}
        >
          <DialogHeader>
            <DialogTitle>Rejoindre un club</DialogTitle>
            <DialogDescription>
              Entrez le code d&apos;invitation donné par votre entraîneur (12 caractères, ex. ABCD-EFGH-JKMN).
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Input
              aria-label="Code d'invitation"
              value={code}
              // Typed in any case, with or without dashes: shown grouped by four.
              onChange={(e) =>
                setCode(formatInviteCode(normalizeInviteCode(e.target.value).slice(0, INVITE_CODE_LENGTH)))
              }
              placeholder="ABCD-EFGH-JKMN"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={join.isPending}
              className="text-center font-mono text-lg tracking-widest uppercase"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={join.isPending || normalizeInviteCode(code).length !== INVITE_CODE_LENGTH}>
              Rejoindre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
