"use client";

import { Vote } from "lucide-react";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { usePolls } from "../hooks/use-polls";
import { CreatePollDialog } from "./create-poll-dialog";
import { PollCard } from "./poll-card";

export function PollsOverview() {
  const { data: polls, isPending, error } = usePolls();
  const { data: team } = useMyTeam();
  const isCoach = team?.role === "COACH";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Sondages</h1>
        {isCoach && <CreatePollDialog />}
      </div>
      {isPending && <p className="text-muted-foreground">Chargement...</p>}
      {error && <p className="text-destructive">{error.message}</p>}
      {polls?.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border p-8 text-center text-muted-foreground">
          <Vote className="size-8" />
          <p>Aucun sondage pour le moment.</p>
        </div>
      )}
      {polls?.map((poll) => <PollCard isCoach={isCoach} key={poll.id} poll={poll} />)}
    </div>
  );
}
