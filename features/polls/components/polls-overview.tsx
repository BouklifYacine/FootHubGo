"use client";

import { Vote } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Page, PageHeader } from "@/components/app/page-header";
import { useMyTeam } from "@/features/team/hooks/use-my-team";
import { usePolls } from "../hooks/use-polls";
import { CreatePollDialog } from "./create-poll-dialog";
import { PollCard } from "./poll-card";

export function PollsOverview() {
  const { data: polls, isPending, error, refetch } = usePolls();
  const { data: team } = useMyTeam();
  const isCoach = team?.role === "COACH";

  return (
    <Page className="max-w-2xl">
      <PageHeader
        title="Sondages"
        description={isCoach ? "Demande l'avis de l'équipe : repas, horaires, maillots..." : "Vote aux sondages de ton équipe."}
        actions={isCoach && <CreatePollDialog />}
      />
      {isPending ? (
        <LoadingState variant="cards" rows={2} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : polls.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="Aucun sondage pour le moment"
          description={isCoach ? "Crée le premier : ton équipe vote depuis son téléphone." : "Ton coach n'a encore rien demandé."}
        />
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <PollCard isCoach={isCoach} key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </Page>
  );
}
