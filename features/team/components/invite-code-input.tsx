"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { INVITE_CODE_LENGTH, formatInviteCode, normalizeInviteCode } from "../invite-code";

/**
 * The 12-character invite code field (typed in any case, with or without dashes, shown XXXX-XXXX-XXXX)
 * and its submit button. Used by the no-club home, the "J'ai un code" page and the join dialog.
 */
export function InviteCodeInput({
  onSubmit,
  pending,
  submitLabel = "Rejoindre",
  defaultCode = "",
  className,
  autoFocus,
}: {
  onSubmit: (code: string) => void;
  pending?: boolean;
  submitLabel?: string;
  defaultCode?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const [code, setCode] = useState(formatInviteCode(normalizeInviteCode(defaultCode)));
  const complete = normalizeInviteCode(code).length === INVITE_CODE_LENGTH;

  return (
    <form
      className={cn("flex flex-col gap-2 sm:flex-row", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (complete) onSubmit(normalizeInviteCode(code));
      }}
    >
      <Input
        aria-label="Code d'invitation"
        value={code}
        onChange={(e) => setCode(formatInviteCode(normalizeInviteCode(e.target.value).slice(0, INVITE_CODE_LENGTH)))}
        placeholder="ABCD-EFGH-JKMN"
        autoComplete="off"
        autoCapitalize="characters"
        autoFocus={autoFocus}
        spellCheck={false}
        enterKeyHint="go"
        disabled={pending}
        className="h-12 text-center font-mono text-lg tracking-widest uppercase md:h-10"
      />
      <Button type="submit" size="lg" disabled={pending || !complete} className="shrink-0">
        {submitLabel} <ArrowRight />
      </Button>
    </form>
  );
}
