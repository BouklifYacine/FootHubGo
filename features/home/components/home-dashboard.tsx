"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Search, Shield } from "lucide-react";
import { ErrorState } from "@/components/app/error-state";
import { LoadingState } from "@/components/app/loading-state";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ClubFormDialog } from "@/features/clubs/components/club-form-dialog";
import { MyJoinRequests } from "@/features/join-requests/components/my-join-requests";
import { InviteCodeInput } from "@/features/team/components/invite-code-input";
import { useJoinWithCode } from "@/features/team/hooks/use-join-with-code";
import { useHome } from "../hooks/use-home";
import { FirstRunChecklist } from "./first-run-checklist";
import { KeyStats } from "./key-stats";
import { Leaderboard } from "./leaderboard";
import { NextEventCard } from "./next-event-card";
import { RecentResults } from "./recent-results";
import { TodoList } from "./todo-list";

/**
 * Home, per role: the next event with the player's answer or the coach's call-up summary, the
 * to-do list, the coach's first steps, then the season (results, stats, leaderboard).
 */
export function HomeDashboard() {
  const { data, isPending, error, refetch } = useHome();
  const { data: session } = authClient.useSession();
  const firstName = session?.user.name.split(" ")[0];

  if (isPending) return <LoadingState variant="detail" className="mx-auto max-w-5xl" />;
  if (error) return <ErrorState error={error} onRetry={refetch} className="mx-auto max-w-5xl" />;
  if (!data) return <NoClub firstName={firstName} />;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{firstName ? `Salut ${firstName} !` : "Accueil"}</h1>
        <p className="text-sm text-muted-foreground max-md:hidden">{data.team.name}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-6 lg:col-span-3">
          <NextEventCard event={data.nextEvent} canManage={data.canManage} />
          <TodoList todo={data.todo} />
          {data.checklist && <FirstRunChecklist checklist={data.checklist} teamLabel={data.team.name} />}
          <RecentResults results={data.recentResults} isPlayer={data.role === "PLAYER"} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <KeyStats teamStats={data.teamStats} playerStats={data.playerStats} />
          <Leaderboard topScorers={data.topScorers} topAssists={data.topAssists} />
        </div>
      </div>
    </div>
  );
}

/** Without a club: two clear choices (I have a code / create my club), then my requests and the directory. */
function NoClub({ firstName }: { firstName?: string }) {
  const [creating, setCreating] = useState(false);
  const join = useJoinWithCode();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {firstName ? `Bienvenue ${firstName} !` : "Bienvenue !"}
        </h1>
        <p className="text-sm text-muted-foreground">Rejoins ton équipe ou crée ton club pour commencer.</p>
      </header>

      <section className="space-y-4 rounded-2xl border-2 border-primary/80 bg-card p-5" aria-labelledby="join-title">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <KeyRound className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="join-title" className="font-semibold">
              J&apos;ai un code d&apos;invitation
            </h2>
            <p className="text-sm text-muted-foreground">Ton coach t&apos;a envoyé un lien ou un code&nbsp;? Entre le code ici.</p>
          </div>
        </div>
        <InviteCodeInput pending={join.isPending} onSubmit={(inviteCode) => join.mutate({ inviteCode })} />
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5" aria-labelledby="create-title">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <Shield className="size-5" aria-hidden />
          </span>
          <div>
            <h2 id="create-title" className="font-semibold">
              Créer mon club
            </h2>
            <p className="text-sm text-muted-foreground">
              Tu es coach ou dirigeant&nbsp;? Crée ton club et sa première équipe, puis invite tes joueurs.
            </p>
          </div>
        </div>
        <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setCreating(true)}>
          Créer mon club
        </Button>
        <ClubFormDialog open={creating} onOpenChange={setCreating} />
      </section>

      <MyJoinRequests compact />

      <Button asChild variant="ghost" className="self-center">
        <Link href="/app/join-requests">
          <Search /> Chercher un club et postuler
        </Link>
      </Button>
    </div>
  );
}
