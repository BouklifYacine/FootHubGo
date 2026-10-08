"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { markOnboardingSeen } from "@/features/onboarding/actions";
import { InviteCodeDialog } from "@/features/team/components/invite-code-dialog";
import { InviteShareButtons } from "@/features/team/components/invite-share";
import type { HomeData } from "../types";

type Checklist = NonNullable<HomeData["checklist"]>;

/**
 * First steps of a coach (derived from the data, no extra table): invite the players, plan an
 * event, send call-ups, say hello in the team channel. Hidden once complete or dismissed (per user).
 */
export function FirstRunChecklist({ checklist, teamLabel }: { checklist: Checklist; teamLabel: string }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const dismiss = useActionMutation(markOnboardingSeen, { toast: false, invalidate: [queryKeys.home] });
  const { steps } = checklist;
  const done = Object.values(steps).filter(Boolean).length;
  const total = Object.keys(steps).length;
  if (checklist.dismissed || done === total || (dismiss.isPending && dismiss.variables === "coach-checklist")) return null;

  const items = [
    {
      done: steps.invitePlayers,
      title: "Invite tes joueurs",
      text: "Partage le lien dans le groupe WhatsApp de l'équipe.",
      action: checklist.inviteCode ? (
        <InviteShareButtons code={checklist.inviteCode} teamLabel={teamLabel} primaryTour="invite-players" />
      ) : (
        <Button size="sm" data-tour="invite-players" onClick={() => setInviteOpen(true)}>
          Créer le lien d&apos;invitation
        </Button>
      ),
    },
    {
      done: steps.createEvent,
      title: "Programme ton premier événement",
      text: "Un match, ou tes entraînements répétés chaque semaine.",
      action: (
        <Button size="sm" variant="outline" asChild>
          <Link href="/app/events?new=1">Nouvel événement</Link>
        </Button>
      ),
    },
    {
      done: steps.sendCallUps,
      title: "Convoque tes joueurs",
      text: "Depuis la page du match : ils répondent depuis leur téléphone.",
      action: (
        <Button size="sm" variant="outline" asChild>
          <Link href="/app/events">Ouvrir l&apos;agenda</Link>
        </Button>
      ),
    },
    {
      done: steps.sayHello,
      title: "Dis bonjour à l'équipe",
      text: "Le salon de la section réunit tous ses membres.",
      action: (
        <Button size="sm" variant="outline" asChild>
          <Link href="/app/chat">Ouvrir les messages</Link>
        </Button>
      ),
    },
  ];
  const nextIndex = items.findIndex((item) => !item.done);

  return (
    <section aria-labelledby="checklist-title" className="rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 id="checklist-title" className="font-semibold">
            Bien démarrer
          </h2>
          <p className="text-sm text-muted-foreground">
            {done} sur {total} étapes faites
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Masquer la liste « Bien démarrer »"
          onClick={() => dismiss.mutate("coach-checklist")}
        >
          <X />
        </Button>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <ol className="mt-4 space-y-4">
        {items.map((item, index) => (
          <li key={item.title} className="flex gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                item.done && "border-success bg-success text-success-foreground",
              )}
              aria-hidden
            >
              {item.done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className={cn("text-sm font-medium", item.done && "text-muted-foreground line-through")}>
                  {item.title}
                  <span className="sr-only">{item.done ? " (fait)" : " (à faire)"}</span>
                </p>
                {!item.done && <p className="text-xs text-muted-foreground">{item.text}</p>}
              </div>
              {index === nextIndex && item.action}
            </div>
          </li>
        ))}
      </ol>
      <InviteCodeDialog open={inviteOpen} onOpenChange={setInviteOpen} code={checklist.inviteCode} sectionName={checklist.sectionName} teamLabel={teamLabel} />
    </section>
  );
}
