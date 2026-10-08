"use client";

import { useState } from "react";
import { Check, Lock, Trophy } from "lucide-react";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDayLabel, formatTime } from "@/lib/format";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";
import { cn } from "@/lib/utils";
import { InitialsAvatar } from "@/features/team/components/initials-avatar";
import { voteManOfTheMatch } from "../actions";
import { useEventMotm } from "../hooks/use-event-motm";
import { MOTM_VOTE_HOURS } from "../rules";
import type { EventMotm } from "../types";

/** Event page block: the man-of-the-match vote (open 48h after the match), then the winner. */
export function MotmCard({ eventId }: { eventId: string }) {
  const { data, isPending, error, refetch } = useEventMotm(eventId);

  if (isPending) return <LoadingState rows={1} />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <section className="rounded-2xl border bg-card p-4" aria-labelledby="motm-title">
      <h2 id="motm-title" className="mb-3 flex items-center gap-2 font-semibold">
        <Trophy className="size-5 text-warning" aria-hidden /> Homme du match
      </h2>
      {data.state === "upcoming" && (
        <p className="text-sm text-muted-foreground">
          Le vote ouvre {formatDayLabel(data.opensAt).toLowerCase()} à {formatTime(data.opensAt)} : les joueurs présents et le coach
          votent pendant {MOTM_VOTE_HOURS}h.
        </p>
      )}
      {data.state === "open" && <OpenVote eventId={eventId} motm={data} />}
      {data.state === "closed" && <Results motm={data} />}
    </section>
  );
}

function OpenVote({ eventId, motm }: { eventId: string; motm: EventMotm }) {
  const [choice, setChoice] = useState<string | null>(motm.myVote);
  const vote = useActionMutation(voteManOfTheMatch, {
    invalidate: [queryKeys.events.motm(eventId), queryKeys.home],
  });
  const voted = motm.nominees.find((nominee) => nominee.userId === motm.myVote);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {motm.turnout.votes} vote{motm.turnout.votes > 1 ? "s" : ""} sur {motm.turnout.voters} · fin du vote{" "}
        {formatDateTime(motm.closesAt)}
      </p>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden /> Résultats dévoilés à la fin du vote, pour tout le monde.
      </p>
      {!motm.canVote ? (
        <p className="text-sm">Le vote est réservé aux joueurs présents au match et aux coachs.</p>
      ) : (
        <>
          {voted && (
            <Badge variant="success">
              <Check aria-hidden /> Tu as voté pour {voted.name}
            </Badge>
          )}
          <div role="radiogroup" aria-label="Ton homme du match" className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {motm.nominees.map((nominee) => (
              <button
                key={nominee.userId}
                type="button"
                role="radio"
                aria-checked={choice === nominee.userId}
                onClick={() => setChoice(nominee.userId)}
                className={cn(
                  "flex min-h-12 items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  choice === nominee.userId ? "border-primary bg-primary/10 font-semibold" : "hover:bg-accent",
                )}
              >
                <InitialsAvatar name={nominee.name} src={nominee.image} className="size-8 shrink-0" />
                <span className="line-clamp-2 min-w-0">{nominee.name}</span>
              </button>
            ))}
          </div>
          <Button
            className="w-full md:w-auto"
            disabled={!choice || choice === motm.myVote || vote.isPending}
            onClick={() => choice && vote.mutate({ eventId, nomineeId: choice })}
          >
            <Trophy /> {motm.myVote ? "Changer mon vote" : "Voter"}
          </Button>
        </>
      )}
    </div>
  );
}

function Results({ motm }: { motm: EventMotm }) {
  const results = motm.results;
  if (!results || results.winners.length === 0) {
    return <p className="text-sm text-muted-foreground">Personne n&apos;a voté pour ce match.</p>;
  }
  const others = results.podium.filter((player) => !results.winners.some((winner) => winner.userId === player.userId));

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap justify-center gap-6">
        {results.winners.map((winner) => (
          <li key={winner.userId} className="flex flex-col items-center gap-1.5 text-center">
            <span className="relative">
              <InitialsAvatar name={winner.name} src={winner.image} className="size-16 ring-2 ring-warning ring-offset-2 ring-offset-card" />
              <Trophy className="absolute -right-1 -bottom-1 size-6 rounded-full bg-warning p-1 text-warning-foreground" aria-hidden />
            </span>
            <span className="font-semibold">{winner.name}</span>
            <span className="text-xs text-muted-foreground">
              {results.votes} vote{results.votes > 1 ? "s" : ""}
            </span>
          </li>
        ))}
      </ul>
      {results.winners.length > 1 && <p className="text-center text-sm text-muted-foreground">Égalité : ils partagent le titre.</p>}
      {others.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Ensuite : {others.map((player) => `${player.name} (${player.votes})`).join(", ")}
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {motm.turnout.votes} vote{motm.turnout.votes > 1 ? "s" : ""} sur {motm.turnout.voters}
      </p>
    </div>
  );
}
