"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OTPInput, type SlotProps } from "input-otp";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { joinTeamWithCode } from "../actions/member-actions";

/** "Rejoindre un club" button + dialog asking for the 6-digit invite code. */
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
              Entrez le code d&apos;invitation à 6 chiffres donné par votre entraîneur.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <OTPInput
              value={code}
              onChange={(value) => setCode(value.replace(/\D/g, ""))}
              maxLength={6}
              inputMode="numeric"
              disabled={join.isPending}
              containerClassName="flex items-center gap-3 has-disabled:opacity-50"
              render={({ slots }) => (
                <div className="flex gap-2">
                  {slots.map((slot, index) => (
                    <Slot key={index} {...slot} />
                  ))}
                </div>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={join.isPending || code.length !== 6}>
              Rejoindre
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Slot({ char, isActive }: SlotProps) {
  return (
    <div
      className={cn(
        "border-input bg-background text-foreground flex size-9 items-center justify-center rounded-md border font-medium shadow-xs transition-[color,box-shadow]",
        isActive && "border-ring ring-ring/50 z-10 ring-[3px]",
      )}
    >
      {char}
    </div>
  );
}
