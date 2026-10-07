"use client";

import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, Lock, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useClosePoll, useDeletePoll, useVote } from "../hooks/use-polls";
import type { Poll } from "../types";

const listNames = (names: string[]) => (names.length > 3 ? `${names.slice(0, 3).join(", ")} +${names.length - 3}` : names.join(", "));

/** One poll: click an option to vote (click again to remove it). Results are visible to everyone. */
export function PollCard({ poll, isCoach }: { poll: Poll; isCoach: boolean }) {
  const vote = useVote();
  const close = useClosePoll();
  const remove = useDeletePoll();
  const total = Math.max(1, poll.results.reduce((sum, r) => sum + r.count, 0));

  const choose = (option: string) => {
    const selected = poll.myChoices.includes(option);
    const choices = poll.isMulti
      ? selected
        ? poll.myChoices.filter((c) => c !== option)
        : [...poll.myChoices, option]
      : selected
        ? []
        : [option];
    vote.mutate({ pollId: poll.id, choices });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base">{poll.question}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {poll.creatorName} · {poll.voterCount} votant{poll.voterCount > 1 ? "s" : ""}
            {poll.isMulti && " · plusieurs choix possibles"}
            {poll.expiresAt && !poll.isClosed && ` · se termine ${formatDistanceToNow(poll.expiresAt, { addSuffix: true, locale: fr })}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {poll.isClosed && (
            <Badge variant="secondary">
              <Lock className="size-3" /> Terminé
            </Badge>
          )}
          {isCoach && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="Options du sondage" size="icon" variant="ghost">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!poll.isClosed && <DropdownMenuItem onClick={() => close.mutate(poll.id)}>Clôturer</DropdownMenuItem>}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => confirm("Supprimer ce sondage ?") && remove.mutate(poll.id)}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {poll.results.map(({ option, count, voters }) => {
          const mine = poll.myChoices.includes(option);
          const percent = Math.round((count / total) * 100);
          return (
            <button
              className={cn(
                "relative w-full overflow-hidden rounded-md border p-2 text-left text-sm transition-colors enabled:hover:border-primary disabled:cursor-default",
                mine && "border-primary",
              )}
              disabled={poll.isClosed || vote.isPending}
              key={option}
              onClick={() => choose(option)}
              type="button"
            >
              <span className="absolute inset-y-0 left-0 bg-primary/10" style={{ width: `${percent}%` }} />
              <span className="relative flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium">
                  {mine && <Check className="size-4 text-primary" />}
                  {option}
                </span>
                <span className="text-muted-foreground">
                  {count} ({percent}%)
                </span>
              </span>
              {voters.length > 0 && <span className="relative mt-1 block text-xs text-muted-foreground">{listNames(voters)}</span>}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
