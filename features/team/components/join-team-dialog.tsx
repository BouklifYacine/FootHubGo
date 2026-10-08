"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/app/responsive-dialog";
import { useJoinWithCode } from "../hooks/use-join-with-code";
import { InviteCodeInput } from "./invite-code-input";

/**
 * "Rejoindre une section" button + dialog asking for the invite code. Members of a club use it to
 * join another section of their club.
 */
export function JoinTeamDialog({ label = "Rejoindre un club" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const join = useJoinWithCode(() => setOpen(false));

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline">
          <Send /> {label}
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{label}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Entre le code d&apos;invitation donné par ton coach (12 caractères, ex. ABCD-EFGH-JKMN).
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <InviteCodeInput autoFocus pending={join.isPending} onSubmit={(inviteCode) => join.mutate({ inviteCode })} />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
